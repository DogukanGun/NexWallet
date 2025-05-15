FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy tsconfig.json
COPY tsconfig.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Expose port
EXPOSE 8004

# Start the application
CMD ["npm", "start"] 