FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Start the development server and expose it to the host
CMD ["npm", "run", "dev", "--", "--host"]
