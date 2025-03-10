const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
/**
 * Get a fragment's metadata
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;

    logger.debug(
      {
        method: req.method,
        path: req.path,
        fragmentId: id,
        ownerId: req.user,
      },
      'Getting fragment metadata'
    );

    // Try to get the fragment
    try {
      const fragment = await Fragment.byId(req.user, id);

      logger.info(
        {
          fragmentId: id,
          ownerId: req.user,
        },
        'Fragment metadata retrieved successfully'
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
          },
        })
      );
    } catch (err) {
      if (err.message.includes('does not exist')) {
        logger.warn({ err, fragmentId: id }, 'Fragment not found');
        return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
      }
      throw err; // re-throw to be handled by the outer catch
    }
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragment metadata');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
