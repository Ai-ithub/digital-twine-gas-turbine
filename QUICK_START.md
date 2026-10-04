# 🚀 Quick Start Guide

## ⚠️ Prerequisites

### 1. Install Docker Desktop for Windows

1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and set up Docker Desktop
3. Make sure Docker Desktop is running

```powershell
# Check the Docker installation
docker --version
docker-compose --version
```

### 2. The .env file

The `.env` file has already been created. You can change the values.

## 🔧 Starting the System

### Step 1: Start all services

```powershell
# In the project root
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 2: Wait for the Database to be ready

```powershell
# Check the MySQL log
docker-compose logs mysql

# Check that the Database is ready
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
# Password: root_password_123
```

### Step 3: Start the Frontend (in a new terminal)

```powershell
cd frontend
npm install
npm run dev
```

## 🌐 Accessing Services

| Service | Address | Login info |
|-------|------|--------------|
| **Backend API** | http://localhost:5000 | JWT Token required |
| **Frontend** | http://localhost:5173 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **MLflow** | http://localhost:5001 | - |
| **InfluxDB** | http://localhost:8086 | Token required |

## 🔐 Login and Getting a Token

```powershell
# Login and get a Token
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username": "admin", "password": "admin123"}'

# Save the Token
$token = $response.token
Write-Host "Token: $token"

# Use the Token
Invoke-RestMethod -Uri "http://localhost:5000/api/data/get_live_data" `
  -Headers @{Authorization = "Bearer $token"}
```

## 👤 Default Users

- **admin** / **admin123** (role: admin)
- **engineer** / **admin123** (role: engineer)
- **operator** / **admin123** (role: operator)

⚠️ **Note:** Be sure to change the passwords in production!

## 📊 Checking System Status

### Viewing service logs

```powershell
# Backend
docker-compose logs -f backend

# Kafka
docker-compose logs -f kafka

# DVR Consumer
docker-compose logs -f dvr-consumer

# RTM Consumer
docker-compose logs -f rtm-consumer

# RTO Consumer
docker-compose logs -f rto-consumer
```

### Checking Metrics in Prometheus

1. Open: http://localhost:9090
2. Search for the metric: `api_request_duration_seconds`
3. View other metrics in Grafana: http://localhost:3000

## 🛑 Stopping the System

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔄 Restarting

```powershell
# Restart
docker-compose restart

# Restart a specific service
docker-compose restart backend
```

## ❗ Troubleshooting

### Problem: Port is in use

```powershell
# Check port usage
netstat -ano | findstr :5000
netstat -ano | findstr :3307
netstat -ano | findstr :9092

# Or change the port in docker-compose.yml
```

### Problem: Services do not start

```powershell
# Check the error logs
docker-compose logs --tail=50

# Check the status
docker-compose ps
```

### Problem: Database not initialized

```powershell
# Check init.sql
cat init/init.sql

# Run manually
docker-compose exec mysql mysql -u root -p compressor_db < init/init.sql
# Password: root_password_123
```

## ✅ Setup Checklist

- [ ] Docker Desktop is installed and running
- [ ] The `.env` file exists
- [ ] All containers are running (`docker-compose ps`)
- [ ] The Backend API responds (http://localhost:5000)
- [ ] You can log in and get a Token
- [ ] Grafana is accessible (http://localhost:3000)
- [ ] Prometheus is accessible (http://localhost:9090)
- [ ] The Frontend is running (http://localhost:5173)

---

**The system is ready!** 🎉

