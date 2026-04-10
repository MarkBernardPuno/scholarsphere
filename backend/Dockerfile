# Dockerfile for Scholar Sphere API (FastAPI + PostgreSQL)

# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default FastAPI/uvicorn port)
EXPOSE 8000

# Set environment variables (override in docker-compose or at runtime)
ENV PYTHONUNBUFFERED=1

# Command to run the API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
