# Use the official Node.js image.
FROM node:18

# Create a non-root user and set permissions.
RUN useradd -m appuser

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package.json ./

# Install dependencies.
RUN npm install --force

# Copy the rest of the application code.
COPY . .

# Build the application.
RUN npm run build

# Change ownership of the app directory to the non-root user.
RUN chown -R appuser:appuser /app

# Switch to the non-root user.
USER appuser

# Expose the port the app runs on.
EXPOSE 3000

# Start the application.
CMD ["npm", "start"] 