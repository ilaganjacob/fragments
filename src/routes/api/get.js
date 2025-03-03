// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
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

    const expand = req.query.expand === '1';

    logger.debug(
      {
        expand,
      },
      'Expand paramter detected'
    );

    // Get the fragments for the current user
    // 'false' means we only want fragment ids
    // 'true' gives full fragments
    const fragments = await Fragment.byUser(req.user, expand);

    // Debug log: Fragment retrieval details
    logger.debug(
      {
        fragmentCount: fragments.length,
        expanded: expand,
      },
      'Fragments received for user'
    );

    // Info log: Successful fragment retrieval
    logger.info(
      {
        ownerId: req.user,
        fragmentCount: fragments.length,
        expanded: expand,
      },
      'Successfully returned user fragments'
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
