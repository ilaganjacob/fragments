// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
// Create a router on which to mount our API endpoints
const router = express.Router();
const logger = require('../../logger');

const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

// Define routes for fragments
router.get('/fragments', require('./get'));
router.get('/fragments/:id/info', require('./get-id-info'));
router.get('/fragments/:id', require('./get-by-id'));

// Other routes (POST, DELETE, etc.) will go here later on...
// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        // See if we can parse this content type and if we support it
        const { type } = contentType.parse(req);
        const supported = Fragment.isSupportedType(type);

        // Debug the content type checking
        logger.debug(
          {
            contentType: req.get('content-type'),
            parsedType: type,
            supported,
          },
          'Content type check'
        );

        return supported;
      } catch (err) {
        logger.error({ err, contentType: req.get('content-type') }, 'Error parsing content type');
        return false;
      }
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), require('./post'));
router.put('/fragments/:id', rawBody(), require('./put'));
router.delete('/fragments/:id', require('./delete'));

module.exports = router;
