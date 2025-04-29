# Use node alpine as base image
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Start a new stage with nginx to serve the static files
FROM nginx:alpine

# Copy the build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add support for host.docker.internal resolution on Linux
RUN apk add --no-cache bash


# Expose port 80
EXPOSE 80


# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]