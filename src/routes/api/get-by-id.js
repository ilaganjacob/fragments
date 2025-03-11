// In src/routes/api/get-by-id.js

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
        txt: 'text/plain',
        html: 'text/html',
        md: 'text/markdown',
        json: 'application/json',
        // Add other mappings as needed
      };

      desiredType = extensionMap[ext];

      if (!desiredType) {
        logger.warn(`Unsupported extension: ${extension}`);
        return res
          .status(415)
          .json(createErrorResponse(415, `Unsupported extension: ${extension}`));
      }
    }

    try {
      // Try to get the fragment by ID
      const fragment = await Fragment.byId(req.user, id);

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
          const convertedData = convert(data, fragment.mimeType, desiredType);

          // Set Content-Type header and send converted data
          res.setHeader('Content-Type', desiredType);
          return res.status(200).send(convertedData);
        } catch (err) {
          logger.error({ err }, 'Conversion error');
          return res.status(415).json(createErrorResponse(415, `Error converting: ${err.message}`));
        }
      }

      // No conversion needed, send original data with original type
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    } catch (err) {
      // If the fragment doesn't exist, return 404
      if (err.message.includes('does not exist')) {
        logger.warn({ id }, 'Fragment not found');
        return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found`));
      }

      // For other errors, return 500
      logger.error({ err }, 'Error retrieving fragment');
      return res.status(500).json(createErrorResponse(500, 'Internal server error'));
    }
  } catch (err) {
    logger.error({ err }, 'Unexpected error processing request');
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
