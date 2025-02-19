# This file defines all of Docker's instructions for Docker engine to build an image.

# Multi-stage build for fragments microservice
# Build stage
FROM node:20.18.0-alpine AS builder

LABEL maintainer="Jacob Ilagan <jilagan5@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Create non-root user for building. Security best practice
RUN addgroup -S fragments && \
    adduser -S fragments -G fragments

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false


# Use /app as our workdir
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
