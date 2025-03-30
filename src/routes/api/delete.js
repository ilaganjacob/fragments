// src/routes/api/delete.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Delete a fragment with the specified id
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug({ id }, 'DELETE fragment request');

    try {
      // First, check if the fragment exists
      await Fragment.byId(req.user, id);

      // If it exists, delete it
      await Fragment.delete(req.user, id);

      logger.info({ id }, 'Fragment successfully deleted');
      res.status(200).json(createSuccessResponse());
    } catch (error) {
      // If the fragment doesn't exist, return a 404
      if (error.message.includes('does not exist')) {
        logger.warn({ id }, 'Fragment not found');
        return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found`));
      }
      // For any other error, return a 500
      throw error;
    }
  } catch (error) {
    logger.error({ error }, 'Error deleting fragment');
    res.status(500).json(createErrorResponse(500, 'Unable to delete fragment'));
  }
};
