# Complete Docker Workflow Guide for Fragments API

This guide outlines the complete workflow for developing, testing, and deploying your Fragments API project using Docker and EC2.

## Local Development Workflow

### 1. Implement New Features

1. Make code changes locally
2. Run tests locally:
   ```bash
   npm test
   npm run coverage  # Make sure tests cover at least 80% of your code
   ```
3. Test locally with `npm run dev` or using Docker:
   ```bash
   docker build -t fragments:dev .
   docker run --rm --name fragments-dev --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 fragments:dev
   ```

### 2. Push Changes to GitHub

```bash
git add .
git commit -m "Implemented new feature: XYZ"
git push origin main
```

## Automated CI/CD Process

### 3. GitHub Actions CI/CD

After pushing to GitHub:

1. GitHub Actions automatically runs tests and linting
2. If tests pass, it builds a Docker image
3. The image is pushed to Docker Hub as `[username]/fragments:latest`

You can check the status of these workflows in the "Actions" tab of your GitHub repository.

## Testing on EC2

### 4. Connect to EC2

```bash
ssh -i [your-key.pem] ec2-user@[your-ec2-instance-dns]
```

### 5. Pull and Run the Latest Docker Image

```bash
# Pull the latest image from Docker Hub
docker pull ilaganjacob/fragments:latest

# Stop any existing container (if necessary)
docker stop fragments

# Run the new container with Basic Auth for testing
docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d ilaganjacob/fragments:latest

# Or run with Cognito Auth for production
docker run --rm --name fragments --env-file .env -p 8080:8080 -d ilaganjacob/fragments:latest

# Check the logs to verify it's running correctly
docker logs fragments
```

### 6. Test Your EC2 Deployment

```bash
# Test the health check endpoint
curl http://localhost:8080

# Test fragment creation (using Basic Auth)
curl -i -X POST -u user1@email.com:password1 -H "Content-Type: text/plain" -d "Test fragment" http://localhost:8080/v1/fragments

# Test getting all fragments
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments

# Test expanded view
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments?expand=1

# Test getting fragment by ID (replace [id] with an actual fragment ID)
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments/[id]

# Test getting fragment metadata
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments/[id]/info

# Test deleting a fragment
curl -i -X DELETE -u user1@email.com:password1 http://localhost:8080/v1/fragments/[id]
```

## Environment Files

### Basic Auth (env.jest)

For testing with Basic Auth, your `env.jest` file should contain:

```
HTPASSWD_FILE=tests/.htpasswd
LOG_LEVEL=debug
PORT=8080
```

### Cognito Auth (.env)

For production with AWS Cognito, your `.env` file should contain:

```
AWS_COGNITO_POOL_ID=us-east-1_[your-pool-id]
AWS_COGNITO_CLIENT_ID=[your-client-id]
LOG_LEVEL=info
PORT=8080
```

## Troubleshooting

### Container Won't Start

Check logs for errors:

```bash
docker logs fragments
```

### Authentication Issues

Verify you're using the correct environment file:

- For Basic Auth: `--env-file env.jest`
- For Cognito Auth: `--env-file .env`

### HTTP 404 or Connection Issues

Make sure your port mappings are correct:

```bash
docker ps
```

Look for the correct port mapping (e.g., `0.0.0.0:8080->8080/tcp`)

### Docker Hub Issues

If your image isn't updating on Docker Hub:

1. Check GitHub Actions for errors
2. Try manually pushing:
   ```bash
   docker build -t ilaganjacob/fragments:latest .
   docker push ilaganjacob/fragments:latest
   ```

## Version Control and Releases

To create a new versioned release:

```bash
# Update the version in package.json and create a git tag
npm version patch -m "Release %s"  # For small fixes
npm version minor -m "Release %s"  # For new features
npm version major -m "Release %s"  # For breaking changes

# Push with tags to trigger CD workflow
git push origin main --tags
```

## Key Commands Reference

```bash
# Build image locally
docker build -t fragments:latest .

# Run locally with Basic Auth
docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 fragments:latest

# Pull latest from Docker Hub
docker pull ilaganjacob/fragments:latest

# Run from Docker Hub on EC2
docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d ilaganjacob/fragments:latest

# View logs
docker logs fragments

# Stop container
docker stop fragments

# List running containers
docker ps

# Get a shell in the container (for debugging)
docker exec -it fragments /bin/sh
```
