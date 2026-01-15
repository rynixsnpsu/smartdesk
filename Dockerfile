FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy server
COPY server/ ./server/

# Copy client
COPY client/ ./client/

# Build client
WORKDIR /app/client
RUN npm install && npm run build

# Move back
WORKDIR /app

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]