// src/routes/api/put.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.debug(
      {
        method: req.method,
        path: req.path,
        params: req.params,
        body: Buffer.isBuffer(req.body) ? `Buffer [${req.body.length} bytes]` : req.body,
        headers: req.headers,
      },
      'PUT fragment request'
    );

    const { id } = req.params;
    const contentType = req.get('content-type');

    // Ensure we have a Buffer
    if (!Buffer.isBuffer(req.body)) {
      logger.warn({ contentType }, 'Request body is not a Buffer');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }

    try {
      // First, get the existing fragment to make sure it exists
      const fragment = await Fragment.byId(req.user, id);

      // Make sure the content type matches the original fragment
      if (fragment.type !== contentType) {
        logger.warn(
          { originalType: fragment.type, newType: contentType },
          'Content type does not match original fragment'
        );
        return res
          .status(400)
          .json(
            createErrorResponse(
              400,
              `Content type cannot be changed from ${fragment.type} to ${contentType}`
            )
          );
      }

      // Update the fragment's data
      await fragment.setData(req.body);

      logger.info(
        { id, size: req.body.length, type: contentType },
        'Fragment successfully updated'
      );

      // Return the updated fragment information
      res.status(200).json(
        createSuccessResponse({
          fragment: {
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created,
            updated: fragment.updated,
            type: fragment.type,
            size: fragment.size,
          },
        })
      );
    } catch (error) {
      // If the fragment doesn't exist
      if (error.message.includes('does not exist')) {
        logger.warn({ id }, 'Fragment not found');
        return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found`));
      }

      throw error;
    }
  } catch (error) {
    logger.error({ error }, 'Error updating fragment');
    res.status(500).json(createErrorResponse(500, 'Unable to update fragment'));
  }
};
