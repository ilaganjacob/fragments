# This file defines all of Docker's instructions for Docker engine to build an image.

# Multi-stage build for fragments microservice
# Build stage
FROM node:20.18.0-alpine@sha256:b1e0880c3af955867bc2f1944b49d20187beb7afa3f30173e15a97149ab7f5f1 AS builder

LABEL maintainer="Jacob Ilagan <jilagan5@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Create non-root user for building. Security best practice
RUN addgroup -S fragments && \
    adduser -S fragments -G fragments

# Set working directory and ownership
WORKDIR /app
RUN chown -R fragments:fragments /app

# Switch to non-root user
USER fragments

# Copy package files with explicit ownership
COPY --chown=fragments:fragments package*.json ./

# Install dependencies for production only
RUN npm ci --only=production


# Copy source code with explicit ownership
COPY --chown=fragments:fragments ./src ./src
COPY --chown=fragments:fragments ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Runtime stage
FROM node:20.18.0-alpine@sha256:b1e0880c3af955867bc2f1944b49d20187beb7afa3f30173e15a97149ab7f5f1 AS runtime

# Create runtime user
RUN addgroup -S fragments && \
    adduser -S fragments -G fragments

# Set environment variables
ENV PORT=8080 \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false    

# Set working directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder --chown=fragments:fragments /app .

# Switch to non-root user for runtime
USER fragments

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start the application
CMD ["npm", "start"]
