FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (layer cache)
# All deps including gsap, d3, leaflet etc. are declared in package.json
COPY package*.json ./

# Install all deps — node_modules is protected by docker-compose anonymous volume
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Start the development server and expose it to the host
CMD ["npm", "run", "dev", "--", "--host"]
