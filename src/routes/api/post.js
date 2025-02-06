const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Request body is not a Buffer');
    // Wrong media type code
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
};
