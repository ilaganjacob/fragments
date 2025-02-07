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
      'Incoming GET fragment by ID request'
    );

    // Retrieve the specific fragment
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Debug log: Fragment retrieval details
    logger.debug(
      {
        fragmentId: fragment.id,
        type: fragment.type,
        size: fragment.size,
      },
      'The fragment info that was retrieved'
    );

    // Info log: Successful fragment retrieval
    logger.info(
      {
        ownerId: req.user,
        fragmentId: req.params.id,
      },
      'Successfully returned specific fragment'
    );

    res.status(200).json(createSuccessResponse({ fragment }));
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
