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
      'Expand parameter detected'
    );

    // Get the fragments for the current user
    // 'false' means we only want fragment ids
    // 'true' gives full fragments
    let fragments = await Fragment.byUser(req.user, expand);

    // If expand=1 was used and we have Fragment instances
    if (expand && Array.isArray(fragments)) {
      // Convert the fragments to plain objects with formats included
      fragments = fragments.map((fragment) => {
        // Get the basic fragment data
        const plainFragment = {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        };

        // Add formats if available
        if (typeof fragment.formats !== 'undefined') {
          plainFragment.formats = fragment.formats;
        }

        return plainFragment;
      });
    }
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
