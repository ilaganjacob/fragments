# This file defines all of Docker's instructions for Docker engine to build an image.

# Multi-stage build for fragments microservice
# Build stage
FROM node:20.18.0-alpine AS builder

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
COPY --chown=fragments:fragments ./tests/.htppaswd ./tests/.htpasswd

# Stage 2: Runtime stage
FROM node:20.18.0-alpine AS runtime

# Create runtime user
RUN addgroup -S fragments && \
    adduser -S fragments -G fragments

    
