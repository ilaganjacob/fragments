const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Request body is not a Buffer');
    // Wrong media type code
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Try to create and save the fragment
  try {
    // Get what type of content they sent (from Content-Type header)
    const contentType = req.get('content-type'); // e.g. "text/plain"

    // owner (from auth middleware in req.user)
    // type (from Content-Type header)
    // size (length of the data they sent)
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });

    // Save the fragment metadata
    await fragment.save();

    // Save the actual content
    await fragment.setData(req.body);

    // Create Location header URL using the new fragment's id
    // If API_URL is in .env, use that or else create from req

    let fragmentsUrl;
    if (process.env.API_URL) {
      fragmentsUrl = new URL('/v1/fragments/', process.env.API_URL);
    } else {
      fragmentsUrl = new URL(`/v1/fragments/`, `${req.protocol}://{req.headers.host}`);
    }

    // This is the URL where we can GET this fragment
    const location = new URL(fragment.id, fragmentsUrl).href;

    // Return the fragment's metadata and location
    res
      .location(location)
      .status(201)
      .json(
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
    logger.error({ err }, 'Error creating fragment');
    res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
};
