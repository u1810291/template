FROM node:22.8.0

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Install ts-node-dev globally for hot reload (optional if used in package.json)
RUN npm install -g ts-node-dev

# Expose port
EXPOSE 3000

# Start the app in dev mode (with hot reload)
CMD ["npm", "run", "start:dev"]
