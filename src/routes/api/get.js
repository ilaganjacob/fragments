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
  } catch (err) {
    logger.error({ err }, 'Unexpected error receiving fragments');
  }
};
