# Build stage
FROM python:3.11 as builder

# Set the working directory
WORKDIR /app

# Install system dependencies including Rust
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    pkg-config \
    libssl-dev \
    git \
    python3-dev \
    cmake \
    gfortran \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Install pipx and Poetry using pip
RUN pip install --no-cache-dir pipx \
    && pipx install poetry

# Ensure Poetry is in PATH
ENV PATH="/root/.local/bin:$PATH"

# Configure poetry to not use virtual environments in Docker
RUN poetry config virtualenvs.create false

# Copy the necessary files for installing dependencies
COPY pyproject.toml poetry.lock ./

# Install dependencies (excluding development dependencies)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir cython numpy wheel setuptools && \
    BLIS_COMPILER="gcc" poetry install --without dev || \
    (BLIS_COMPILER="gcc" poetry install --without dev || \
    BLIS_COMPILER="gcc" poetry install --without dev)

# Copy the rest of the application code
COPY . .

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages and application code from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["python", "main.py"]
