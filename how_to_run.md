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

# Run the UI container
docker run --rm --name fragments-ui -p 1234:80 fragments-ui:latest

# Run in detached mode
docker run --rm --name fragments-ui -p 1234:80 -d fragments-ui:latest

# Stop container
docker stop fragments-ui
```
