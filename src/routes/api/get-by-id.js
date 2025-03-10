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
        user: req.user,
        fragmentId: req.params.id,
      },
      'Incoming GET fragment by ID request'
    );

    // Check if the id includes an extension
    let id = req.params.id;
    let extension = path.extname(id);
    let desiredType;

    // If there's an extension, remove it from the id and store the extension
    if (extension) {
      id = id.replace(extension, '');
      extension = id.toLowerCase().substring(1); // Remove the leading '.'

      // Map extensions to content types
      const extensionToType = {
        txt: 'text/plain',
        html: 'text/html',
        md: 'text/markdown',
        json: 'application/json',
      };

      desiredType = extensionToType[extension];

      if (!desiredType) {
        return res
          .status(415)
          .json(createErrorResponse(415, `Unsupported extension: ${extension}`));
      }
    }

    // Retrieve the specific fragment
    const fragment = await Fragment.byId(req.user, id);

    // Get the raw fragment data
    const data = await fragment.getData();

    // If there's a desired type and it's different from the original type, we need to convert the data
    if (desiredType && fragment.mimeType !== desiredType) {
      // Check fi the conversion is supported
      if (!fragment.formats.includes(desiredType)) {
        return res
          .status(415)
          .json(createErrorResponse(415, `Unsupported conversion: ${desiredType}`));
      }

      try {
        const convertedData = convert(data, fragment.mimeType, desiredType);

        // Set the Content-Type header to the desired type
        res.setHeader('Content-Type', desiredType);

        // Info log: Successful conversion
        logger.info(
          {
            ownerId: req.user,
            fragmentId: id,
            sourceType: fragment.mimeType,
            targetType: desiredType,
          },
          'Successfully converted fragment'
        );

        // Send the converted data
        return res.status(200).send(convertedData);
      } catch (convertErr) {
        logger.error(
          {
            err: convertErr,
            ownerId: req.user,
            fragmentId: id,
            sourceType: fragment.mimeType,
            targetType: desiredType,
          },
          'Error converting fragment'
        );
        return res
          .status(415)
          .json(
            createErrorResponse(415, `Error converting from ${fragment.mimeType} to ${desiredType}`)
          );
      }
    }

    // Set the Content-Type header to match the fragment's type
    res.setHeader('Content-Type', fragment.type);

    // Debug log: Fragment retrieval details
    logger.debug(
      {
        fragmentId: fragment.id,
        type: fragment.type,
        size: fragment.size,
        dataSize: data.length, // Add actual data size
      },
      'Retrieved fragment data and metadata'
    );

    // Info log: Successful fragment retrieval
    logger.info(
      {
        ownerId: req.user,
        fragmentId: req.params.id,
      },
      'Successfully returned specific fragment'
    );

    // Send the raw fragment data
    res.status(200).send(data);
  } catch (err) {
    logger.error(
      {
        err,
        ownerId: req.user,
        fragmentId: req.params.id,
      },
      'Error retrieving fragment'
    );

    // Handles different types of errors
    if (err.message.includes('does not exist')) {
      // Specific error for non-existent fragment
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    } else {
      res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
  }
};
