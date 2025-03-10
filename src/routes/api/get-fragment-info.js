const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/*
Get a fragment's metadata
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
      'Getting fragment data'
    );

    try {
      const fragment = await Fragment.get(id);

      logger.info({})

      res.status(200).json(createSuccessResponse(200, 'Fragment found', fragment));
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
