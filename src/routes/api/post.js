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

    // Use API_URL from environment if defined, otherwise fallback to localhost
    const host = process.env.API_URL ? new URL(process.env.API_URL).host : 'localhost:8080';

    const protocol = process.env.API_URL
      ? new URL(process.env.API_URL).protocol.replace(':', '')
      : req.protocol;

    const locationUrl = `${protocol}://${host}/v1/fragments/${fragment.id}`;

    // Create Location header URL using the new fragment's id
    // If API_URL is in .env, use that or else create from req

    // let fragmentsUrl;
    // if (process.env.API_URL) {
    //   fragmentsUrl = new URL('/v1/fragments/', process.env.API_URL);
    // } else {
    //   fragmentsUrl = new URL(`/v1/fragments/`, `${req.protocol}://{req.headers.host}`);
    // }

    // This is the URL where we can GET this fragment
    // const location = new URL(fragment.id, fragmentsUrl).href;

    // Send success response!

    res
      .location(locationUrl) // Set Location header with URL
      .status(201) // 201 Created
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

/**
 * // 5. SUCCESSFUL RESPONSE LOOKS LIKE:
201 Created
Location: http://localhost:8080/v1/fragments/123abc
{
  "status": "ok",
  "fragment": {
    "id": "123abc",
    "ownerId": "user123",
    "created": "2023-01-01T12:00:00Z",
    "updated": "2023-01-01T12:00:00Z", 
    "type": "text/plain",
    "size": 11
  }
 */
