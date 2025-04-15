// src/routes/api/get-by-id.js
const path = require('path');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const convert = require('../../utils/convert');

module.exports = async (req, res) => {
  try {
    logger.debug(
      {
        method: req.method,
        path: req.path,
        params: req.params,
        user: req.user,
      },
      'GET fragment by ID request'
    );

    // Extract the id and potential extension
    let id = req.params.id;
    const extension = path.extname(id);
    let desiredType;

    // If there's an extension, parse it
    if (extension) {
      // Remove the extension from the id
      id = id.substring(0, id.lastIndexOf('.'));

      // Get the extension without the dot
      const ext = extension.toLowerCase().substring(1);

      // Map extension to content type
      const extensionMap = {
        // Text formats
        txt: 'text/plain',
        html: 'text/html',
        md: 'text/markdown',
        // Data formats
        json: 'application/json',
        yaml: 'application/yaml',
        yml: 'application/yaml',
        csv: 'text/csv',
        // Image formats
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        avif: 'image/avif',
      };

      desiredType = extensionMap[ext];

      logger.debug(
        { extension: ext, desiredType, originalId: req.params.id, parsedId: id },
        'Parsed extension and mapped to content type'
      );

      if (!desiredType) {
        logger.warn({ extension }, 'Unsupported extension');
        return res
          .status(415)
          .json(createErrorResponse(415, `Unsupported extension: ${extension}`));
      }
    }

    try {
      // Try to get the fragment by ID
      const fragment = await Fragment.byId(req.user, id);

      logger.debug(
        {
          id,
          fragmentType: fragment.type,
          desiredType,
          formats: fragment.formats,
          mimeType: fragment.mimeType,
        },
        'Retrieved fragment, preparing response'
      );

      // Get the raw fragment data
      const data = await fragment.getData();

      // If there's a desired type and it's different from the original type,
      // we need to convert the data
      if (desiredType && fragment.mimeType !== desiredType) {
        // Check if this conversion is supported
        if (!fragment.formats.includes(desiredType)) {
          logger.warn(
            {
              fragmentId: id,
              fromType: fragment.mimeType,
              toType: desiredType,
              formats: fragment.formats,
            },
            'Unsupported conversion'
          );

          return res
            .status(415)
            .json(
              createErrorResponse(
                415,
                `Unsupported conversion from ${fragment.mimeType} to ${desiredType}`
              )
            );
        }

        try {
          logger.debug(
            {
              fromType: fragment.mimeType,
              toType: desiredType,
              dataSize: data.length,
            },
            'Attempting format conversion'
          );

          const convertedData = await convert(data, fragment.mimeType, desiredType);

          // Log successful conversion
          logger.info(
            {
              fragmentId: id,
              fromType: fragment.mimeType,
              toType: desiredType,
              originalSize: data.length,
              convertedSize: convertedData.length,
            },
            'Fragment conversion successful'
          );

          // Set Content-Type header and send converted data
          res.setHeader('Content-Type', desiredType);
          return res.status(200).send(convertedData);
        } catch (err) {
          logger.error(
            {
              err,
              stack: err.stack,
              fromType: fragment.mimeType,
              toType: desiredType,
              dataSize: data.length,
            },
            'Conversion error'
          );
          return res.status(415).json(createErrorResponse(415, `Error converting: ${err.message}`));
        }
      }

      // No conversion needed, send original data with original type
      logger.debug(
        { id, type: fragment.type, size: data.length },
        'Sending original fragment data'
      );

      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    } catch (err) {
      // If the fragment doesn't exist, return 404
      if (err.message.includes('does not exist')) {
        logger.warn({ id }, 'Fragment not found');
        return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found`));
      }

      // For other errors, return 500
      logger.error({ err, stack: err.stack }, 'Error retrieving fragment');
      return res.status(500).json(createErrorResponse(500, 'Internal server error'));
    }
  } catch (err) {
    logger.error({ err, stack: err.stack }, 'Unexpected error processing request');
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
