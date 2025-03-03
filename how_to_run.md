# Fragments Project Run Commands

This guide contains the essential commands to run both the fragments API server and fragments-ui applications.

## Fragments API Server

Run these commands from the `fragments/` directory:

### Start Options

```bash
# Development mode with auto-restart
npm run dev

# Debug mode with inspector
npm run debug

# Production mode
npm start
```

### Docker Commands

```bash
# Build the Docker image
docker build -t fragments:latest .

# Run with AWS Cognito auth
docker run --rm --name fragments --env-file .env -p 8080:8080 fragments:latest

# Run with Basic Auth
docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 fragments:latest

# Run in background (detached)
docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d fragments:latest

# View container logs (if running detached)
docker logs fragments

# Stop container (if running detached)
docker stop fragments
```

### EC2 Deployment

```bash
# Create tarball of project for EC2 deployment
npm pack

# Copy tarball to EC2 instance (replace with your EC2 DNS)
scp -i ~/.ssh/your-key-pair.pem fragments-0.0.1.tgz ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com:

# SSH into your EC2 instance
ssh -i ~/.ssh/your-key-pair.pem ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com

# On EC2: Extract the tarball
tar -xzf fragments-0.0.1.tgz
cd package

# On EC2: Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user
# Log out and log back in for group changes to take effect

# On EC2: Build and run Docker container
docker build -t fragments:latest .
docker run --rm --name fragments --env-file env.jest -p 8080:8080 -d fragments:latest
```

### API Testing

```bash
# Health check
curl http://localhost:8080

# Create a fragment (plain text)
curl -i -X POST -u user1@email.com:password1 -H "Content-Type: text/plain" -d "This is a fragment" http://localhost:8080/v1/fragments

# Create a markdown fragment
curl -i -X POST -u user1@email.com:password1 -H "Content-Type: text/markdown" -d "# Heading\n\nThis is **bold** text" http://localhost:8080/v1/fragments

# Get all fragments
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments

# Get specific fragment
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments/{id}

# Get converted fragment (markdown to HTML)
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments/{id}.html

# Get converted fragment (markdown to plain text)
curl -i -u user1@email.com:password1 http://localhost:8080/v1/fragments/{id}.txt
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run coverage

# Run specific test file
npm test fragment-conversion.test.js

# Run tests in watch mode
npm run test:watch
```

## Fragments UI

Run these commands from the `fragments-ui/` directory:

### Environment Configuration

Update your existing `.env` file in fragments-ui with your EC2 instance information:

```ini
# For local development
API_URL=http://localhost:8080

# For EC2 connection (uncomment and update with your EC2 public DNS)
# API_URL=http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:8080
```

When switching between local and EC2 development, simply update the API_URL value.

### Start Options

```bash
# Start development server
npm start

# Build for production
npm run build
```

### Docker Commands

```bash
# Build the Docker image
docker build -t fragments-ui:latest .

# Run the UI container locally
docker run --rm --name fragments-ui -p 1234:80 fragments-ui:latest

# Run with environment variables to connect to EC2
docker run --rm --name fragments-ui \
  -e API_URL=http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:8080 \
  -p 1234:80 fragments-ui:latest

# Run in detached mode
docker run --rm --name fragments-ui -p 1234:80 -d fragments-ui:latest

## THIS IS THE COMMAND THAT WORKS
docker run --rm --name fragments --env-file .env -e LOG_LEVEL=debug -p 8080:8080 -d fragments:latest
##

# Stop container
docker stop fragments-ui
```

### Connecting UI to EC2

When running the fragments-ui locally but connecting to an EC2-hosted fragments API:

1. Update your `.env` file to point to your EC2 instance:

   ```ini
   API_URL=http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:8080
   ```

2. Start the UI:

   ```bash
   npm start
   ```

3. If you've configured AWS Cognito for both your UI and API with the same user pool, you should be able to authenticate and interact with your EC2-hosted API.
