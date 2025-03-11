// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
// Create a router on which to mount our API endpoints
const router = express.Router();

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
      // See if we can parse this content type
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
