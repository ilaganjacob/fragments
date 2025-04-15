// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Debug log: Incoming request details
  logger.debug(
    {
      method: req.method,
      path: req.path,
      contentType: req.get('content-type'),
      contentTypeSupported: Fragment.isSupportedType(req.get('content-type') || ''),
      bodySize: req.body ? req.body.length : 0,
      isBuffer: Buffer.isBuffer(req.body),
      headers: req.headers,
    },
    'Incoming fragment creation request'
  );

  if (!Buffer.isBuffer(req.body)) {
    // Warn log: Invalid request body
    logger.warn(
      {
        contentType: req.get('content-type'),
        body: req.body,
        isBuffer: Buffer.isBuffer(req.body),
      },
      'Request body is not a Buffer'
    );

    // Wrong media type code
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Additional check for content type support
  const contentType = req.get('content-type');
  if (!contentType || !Fragment.isSupportedType(contentType)) {
    logger.warn({ contentType }, 'Unsupported content type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Try to create and save the fragment
  try {
    // Info log: Fragment creation attempt
    logger.info(
      {
        ownerId: req.user,
        contentType,
        bodySize: req.body.length,
      },
      'Attempting to create a fragment'
    );

    // owner (from auth middleware in req.user)
    // type (from Content-Type header)
    // size (length of the data they sent)
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });

    // Debug log: Fragment metadata before save
    logger.debug({ fragmentMetadata: fragment }, 'Fragment metadata before save');

    // Save the fragment metadata
    await fragment.save();

    // Save the actual content
    await fragment.setData(req.body);

    // Info log: Successful fragment creation
    logger.info(
      {
        fragmentId: fragment.id,
        type: fragment.type,
        size: fragment.size,
      },
      'Fragment successfully created'
    );

    // Use API_URL from environment if defined, otherwise fallback to localhost
    const host = process.env.API_URL
      ? new URL(process.env.API_URL).host
      : req.get('host') || 'localhost:8080';
    const protocol = process.env.API_URL
      ? new URL(process.env.API_URL).protocol.replace(':', '')
      : req.protocol;

    const locationUrl = `${protocol}://${host}/v1/fragments/${fragment.id}`;

    // Debug log: Location header details
    logger.debug(
      {
        locationUrl,
        protocol,
        host,
        fragmentId: fragment.id,
      },
      'Generated Location header'
    );

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
    // Error log: Unexpected error during fragment creation
    logger.error(
      {
        err,
        stack: err.stack,
        ownerId: req.user,
        contentType: req.get('content-type'),
      },
      'Unexpected error creating fragment'
    );
    // Warn log: Specific error details
    logger.warn(`Fragment creation failed: ${err.message}`);

    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
