FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files and patches first
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]
