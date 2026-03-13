FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the Express server port
EXPOSE 5000

# Start the application with nodemon for auto-reloading
CMD ["npx", "nodemon", "server.js"]
