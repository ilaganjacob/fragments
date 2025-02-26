// src/auth/cognito.js

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const authorize = require('./auth-middleware');

const logger = require('../logger');

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}

// Log that we're using Cognito
logger.info('Using AWS Cognito for auth');

// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: 'id',
});

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-1.amazonaws.com/<user-pool-id>/.well-known/jwks.json
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      console.log('Verifying Token:', {
        userPoolId: process.env.AWS_COGNITO_POOL_ID,
        clientId: process.env.AWS_COGNITO_CLIENT_ID,
        tokenLength: token.length,
        tokenHeader: token.split('.')[0],
      });

      // Decode token to inspect its contents
      const decoded = require('jwt-decode')(token);
      console.log('Decoded Token:', {
        sub: decoded.sub,
        aud: decoded.aud,
        exp: decoded.exp,
        email: decoded.email,
        username: decoded['cognito:username'],
        currentTime: Math.floor(Date.now() / 1000),
      });

      const user = await jwtVerifier.verify(token);

      console.log('Verification Successful:', {
        email: user.email,
        username: user['cognito:username'],
      });

      done(null, user.email);
    } catch (err) {
      console.error('Token Verification FAILED:', {
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
      });
      done(null, false);
    }
  });
// Now we'll delegate the authorization to our authorize middleware
module.exports.authenticate = () => authorize('bearer');
