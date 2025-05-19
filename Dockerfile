# Use official Node.js base image (with npm)
FROM node:22-slim

# Set the working directory
WORKDIR /app

# Copy Node.js dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy app files and Go binary
COPY . .

RUN ls -la
# Copy the script into the container

# Make Go binary and script executable
RUN chmod +x ./proxy

# Expose for documentation only (you can still override at runtime)
EXPOSE 443 8080

# Start both services via script
CMD ["bash", "-c", "./proxy & node index.js"]


