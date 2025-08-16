# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for npm start)
RUN npm install

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Start the application using the start script
CMD ["npm", "start"] 