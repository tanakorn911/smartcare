FROM python:3.11-slim

WORKDIR /app

# Upgrade pip and install curl if needed for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything
COPY . .

# Expose port (Fly defaults to 8080 usually, we'll configure it to 8000 to match)
EXPOSE 8000

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
