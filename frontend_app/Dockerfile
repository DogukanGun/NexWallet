# Use the official Node.js image.
FROM node:18


# Set the working directory.
WORKDIR /frontend

# Copy package.json and package-lock.json.
COPY package.json ./
COPY package-lock.json ./
# Install dependencies.
RUN npm install --force

# Copy the rest of the application code.
COPY . .

RUN npx prisma generate

# Build the application.
RUN npm run build

# Expose the port the app runs on.
EXPOSE 9123

# Start the application.
CMD ["npm", "start"] 