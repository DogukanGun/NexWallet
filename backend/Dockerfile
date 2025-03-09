# Use the official Python image.
FROM python:3.11

# Set the working directory.
WORKDIR /app

# Install pipx and Poetry using pip
RUN pip install --no-cache-dir pipx \
    && pipx install poetry

# Ensure Poetry is in PATH
ENV PATH="/root/.local/bin:$PATH"

# Configure poetry to not use virtual environments in Docker
RUN poetry config virtualenvs.create false

# Copy the necessary files for installing dependencies.
COPY pyproject.toml ./
COPY poetry.lock ./

# Install dependencies (excluding development dependencies)
RUN poetry install

# Copy the rest of the application code.
COPY . .

# Expose the port the app runs on.
EXPOSE 8080

# Start the application.
CMD ["python", "main.py"]