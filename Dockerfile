# Dockerfile (Final Automated Version)

# --- Stage 1: Base Image ---
FROM python:3.11-slim

# --- Stage 2: Set up Environment ---
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# --- Stage 3: Install Dependencies ---
COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 4: Copy Application Code and Entrypoint Script ---
COPY . .

# NEW: Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# --- Stage 5: Define the Command to Run the App ---
EXPOSE 5000

# NEW: Set the entrypoint to our custom script
ENTRYPOINT ["./entrypoint.sh"]

# The CMD will be passed as arguments to the entrypoint script
CMD ["python", "backend/app.py"]