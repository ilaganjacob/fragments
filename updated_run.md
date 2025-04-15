# Fragments Microservice and UI Deployment Guide

This guide explains how to deploy and run both the Fragments microservice backend and the Fragments UI frontend.

## Fragments Backend (API Server)

### Deploying on AWS EC2

1. **Connect to your EC2 instance**:

   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-instance-address
   ```

2. **Pull the Docker image**:

   ```bash
   docker pull ilaganjacob/fragments:latest
   ```

3. **Run the container with required environment variables**:

   ```bash
   docker run -d -p 8080:8080 \
     -e AWS_COGNITO_POOL_ID=us-east-1_EYYLQIG9O \
     -e AWS_COGNITO_CLIENT_ID=68mumta68qe463m2dmhig4v440 \
     -e API_URL=http://ec2-52-90-21-134.compute-1.amazonaws.com:8080 \
     --name fragments \
     ilaganjacob/fragments:latest
   ```

4. **Verify the service is running**:
   ```bash
   curl http://localhost:8080/
   # Should return a health check response
   ```

### Important Environment Variables for Fragments Backend

- `AWS_COGNITO_POOL_ID`: Your Amazon Cognito User Pool ID
- `AWS_COGNITO_CLIENT_ID`: Your Amazon Cognito App Client ID
- `API_URL`: The publicly accessible URL for your API server
- `LOG_LEVEL`: Optional, defaults to 'info'
- `PORT`: Optional, defaults to 8080

## Fragments UI (Frontend)

### Building the Docker Image

1. **Build with proper environment variables**:

   ```bash
   docker build \
     --build-arg API_URL=http://ec2-52-90-21-134.compute-1.amazonaws.com:8080 \
     --build-arg AWS_COGNITO_POOL_ID=us-east-1_EYYLQIG9O \
     --build-arg AWS_COGNITO_CLIENT_ID=68mumta68qe463m2dmhig4v440 \
     --build-arg OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:8000 \
     -t ilaganjacob/fragments-ui:latest .
   ```

2. **Push to Docker Hub** (optional):
   ```bash
   docker push ilaganjacob/fragments-ui:latest
   ```

### Running Locally

```bash
docker run -d -p 8000:80 --name fragments-ui ilaganjacob/fragments-ui:latest
```

Then access the UI at http://localhost:8000 in your browser.

## Understanding Build-time vs Runtime Environment Variables

### Why Build Arguments Are Used for the UI

For the fragments-ui application, environment variables are needed at **build time** rather than runtime. This is because:

1. **Static Files**: The UI is built into static files (HTML, CSS, JS) during the Docker build process. These files have environment variables "baked in" to them.

2. **No Server**: The UI runs entirely in the browser after being served as static files from NGINX. Unlike the backend, there's no server process reading environment variables at runtime.

3. **Build Arguments**: We use `--build-arg` to pass variables to the Docker build process. These are defined with `ARG` in the Dockerfile and then set as `ENV` variables that the build tools can access.

### Why Runtime Variables Are Used for the Backend

For the fragments backend, environment variables are needed at **runtime** because:

1. **Active Server Process**: The backend is a Node.js server that stays running and can read environment variables while it's operating.

2. **Dynamic Configuration**: The server can adapt to different environment variables without requiring a rebuild.

3. **Runtime Variables**: We pass these using `-e` flags to `docker run` or with `--env-file`.

### Why Both Need Similar Variables

Both services need similar configuration (Cognito credentials, API URLs) but for different purposes:

- **Backend**: Uses these to authenticate users and provide correct URLs in responses
- **Frontend**: Uses these to connect to the backend API and handle authentication with Cognito

## Troubleshooting

### CORS Issues

If you see CORS errors in the browser console, check that your backend has proper CORS configuration:

```javascript
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:8000', 'http://localhost:1234', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Location'],
  })
);
```

### Authentication Issues

Make sure the `OAUTH_SIGN_IN_REDIRECT_URL` matches exactly what's configured in your Cognito User Pool client settings.

### Connection Issues

If the UI can't connect to the backend:

1. Verify the API_URL is correct
2. Check that the backend is running and accessible at that URL

## Testing locally April 15th

HTPASSWD_FILE=tests/.htpasswd LOG_LEVEL=debug npm start
