FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing .pyc files (cleaner container)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

# 1. Update Linux packages
# 2. Upgrade pip (Critical for fixing hash errors)
# 3. Install requirements with a 100-second timeout to handle slow internet
RUN apt-get update && apt-get install -y libpq-dev gcc \
    && pip install --upgrade pip \
    && pip install --no-cache-dir --default-timeout=100 -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "run:app"]