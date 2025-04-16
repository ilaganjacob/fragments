// src/routes/api/get-id-info.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.debug(
      {
        method: req.method,
        path: req.path,
        user: req.user,
        fragmentId: req.params.id,
      },
      'Incoming GET fragment info request'
    );

    // Retrieve the specific fragment
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Info log: Successful fragment metadata retrieval
    logger.info(
      {
        ownerId: req.user,
        fragmentId: req.params.id,
      },
      'Successfully returned fragment metadata'
    );

    // Return the fragment metadata
    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
          formats: fragment.formats,
        },
      })
    );
  } catch (err) {
    logger.error(
      {
        err,
        ownerId: req.user,
        fragmentId: req.params.id,
      },
      'Error retrieving fragment metadata'
    );

    // Handle different types of errors
    if (err.message.includes('does not exist')) {
      // Specific error for non-existent fragment
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    } else {
      res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
  }
};
