// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // Debug log: Incoming request details
    logger.debug(
      {
        method: req.method,
        path: req.path,
        user: req.user,
      },
      'Incoming get fragments request'
    );

    // Get the fragments for the current user
    // 'false' means we only want fragment ids
    // 'true' gives full fragments
    const fragments = await Fragment.byUser(req.user, false);

    // Debug log: Fragment retrieval details
    logger.debug(
      {
        fragmentCount: fragments.length,
      },
      'Fragments received for user'
    );

    // Info log: Successful fragment retrieval
    logger.info(
      {
        ownerId: req.user,
        fragmentCount: fragments.length,
      },
      'Successfully returned user fragment IDs'
    );
    // Return the list of fragment IDs
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    // Error log: Unexpected error during fragment retrieval
    logger.error({ err }, 'Unexpected error receiving fragments');

    // Warn log: Specific error details
    logger.warn(`Fragment retrieval failed: ${err.message}`);

    // Send an error response
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
