# Use the official Node.js image.
FROM node:18
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    ln -sf /usr/bin/pyth
# Set the working directory.
WORKDIR /frontend

# Copy package.json and package-lock.json.
COPY package.json ./
COPY package-lock.json ./

# Install dependencies and rebuild native modules
RUN npm install --force && \
    npm rebuild

# Copy the rest of the application code.
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Expose the port the app runs on.
EXPOSE 9123

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9123

# Start the application with node directly
CMD ["npm", "run", "start"] 
