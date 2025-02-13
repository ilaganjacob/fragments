# Fragments

Cloud Computing Microservice Project

## Prerequisites

- Node.js (LTS version)
- Docker Desktop
- AWS Account (AWS Academy)
- git
- curl (use curl.exe in PowerShell)
- jq (for JSON formatting)
- VSCode with extensions:
  - ESLint
  - Prettier
  - Code Spell Checker
  - GitHub Actions

## Initial Setup

1. Clone the repository:

```bash
git clone git@github.com:your-username/fragments.git
cd fragments
```

2. Install dependencies:

```bash
npm install
```

3. Create necessary environment files:

`.env` for development with AWS Cognito:

```ini
PORT=8080
LOG_LEVEL=debug
AWS_COGNITO_POOL_ID=your-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id
```

`env.jest` for testing with Basic Auth:

```ini
PORT=8080
LOG_LEVEL=silent
HTPASSWD_FILE=tests/.htpasswd
```

## Available Scripts

### Development

```bash
# Run ESLint
npm run lint

# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Start with debugger
npm run debug
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test filename.test.js

# Run tests with coverage report
npm run coverage

# Watch mode for testing
npm run test:watch
```

### API Testing

```bash
# Basic health check
curl localhost:8080

# Pretty print JSON response
curl -s localhost:8080 | jq

# Get headers only
curl -i localhost:8080

# Test authenticated endpoints (replace user/pass)
curl -u user1@email.com:password1 localhost:8080/v1/fragments

# Create a fragment
curl -X POST -u user1@email.com:password1 \
  -H "Content-Type: text/plain" \
  -d "Hello World" \
  localhost:8080/v1/fragments
```

## Docker

### Building Image

```bash
# Build image
docker build -t fragments:latest .

# View built images
docker image ls fragments
```

### Running Container

```bash
# Run container (interactive mode)
docker run --rm --name fragments --env-file env.jest -p 8080:8080 fragments:latest

# Run container (detached mode)
docker run --rm --name fragments --env-file env.jest -p 8080:8080 -d fragments:latest

# View container logs
docker logs fragments

# Follow container logs
docker logs -f fragments

# Stop container
docker stop fragments

# Force stop container
docker kill fragments
```

## AWS EC2 Deployment

1. Start AWS Learner Lab and launch EC2 instance

2. Create project tarball and copy to EC2:

```bash
# Create tarball
npm pack

# Copy to EC2 (replace with your DNS)
scp -i ~/.ssh/key-pair.pem fragments-0.0.1.tgz ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com:
```

3. SSH into EC2:

```bash
ssh -i ~/.ssh/key-pair.pem ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com
```

4. Setup EC2 instance:

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

# Extract project
tar xzf fragments-0.0.1.tgz
cd package
```

5. Build and run Docker container on EC2:

```bash
docker build -t fragments:latest .
docker run --rm --name fragments --env-file env.jest -p 8080:8080 -d fragments:latest
```

## GitHub Actions CI

Push to main branch will automatically:

- Run ESLint
- Run all tests
- Report any failures

Check the Actions tab in GitHub to see CI status.

## Common Issues & Troubleshooting

- If `curl` doesn't work in PowerShell, use `curl.exe`
- Docker container name conflict: Stop existing container before creating new one
- EC2 connection issues: Check security group allows port 8080
- Missing environment variables: Ensure proper .env file is being used
- Test failures: Run specific test file to debug

## Project Structure

```
fragments/
├── .github/workflows/    # GitHub Actions CI configuration
├── src/                 # Source code
├── tests/              # Test files
├── Dockerfile          # Docker configuration
├── .env               # Environment variables (git-ignored)
├── env.jest           # Test environment variables
└── package.json       # Project configuration
```
