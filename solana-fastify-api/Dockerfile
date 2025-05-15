FROM node:18

WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy project manifest and lock file
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy tsconfig.json
COPY tsconfig.json ./

# Install dependencies using pnpm
# Using --frozen-lockfile is recommended for CI/Docker for reproducible builds.
# This requires pnpm-lock.yaml to be present.
# If you still encounter issues that --force solved with npm, you can try adding --force here too,
# e.g., RUN pnpm install --force --frozen-lockfile
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 8004

# Start the application using pnpm
CMD ["pnpm", "start"] 