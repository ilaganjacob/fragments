const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Request body is not a Buffer');
    // Wrong media type code
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Since there can be errors during creation, put in try-catch
  try {
    const contentType = req.get('content-type');
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });

    await fragment.save();
    await fragment.setData(req.body);

    let fragmentsUrl;
    if (process.env.API_URL) {
      fragmentsUrl = new URL('/v1/fragments/', process.env.API_URL);
    } else {
      fragmentsUrl = new URL(`/v1/fragments/`, `${req.protocol}://{req.headers.host}`);
    }
  } catch (err) {
    logger.error({ err }, 'Error creating fragment');
    res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
};
