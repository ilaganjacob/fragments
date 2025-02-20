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

    // Get the raw fragment data
    const data = await fragment.getData();

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
