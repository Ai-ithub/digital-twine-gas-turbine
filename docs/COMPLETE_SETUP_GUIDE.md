# 🚀 Complete System Setup Guide

This guide describes all the steps for setting up the Digital Twin Gas Turbine system.

## 📋 Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for the Frontend)
- 8GB+ RAM recommended

## 🔧 Setup

### 1. Clone and Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd digital-twine-gas-turbine-1

# Create .env file
cp .env.example .env  # if it exists
# Or create the .env file with the following values:
```

### 2. Set Environment Variables

Create the `.env` file:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=your_password
DB_DATABASE=compressor_db

# InfluxDB
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your_influx_token
INFLUXDB_ORG=your_org
INFLUXDB_BUCKET=compressor_metrics

# Kafka
KAFKA_BROKER_URL=kafka:9092
KAFKA_CLUSTER_ID=test-cluster
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRATION_HOURS=24

# OPC-UA (optional)
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=opcua_user
OPCUA_PASSWORD=opcua_password

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# MLflow
MLFLOW_TRACKING_URI=http://mlflow:5000
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### 4. Initialize Database

The Database is initialized automatically with `init/init.sql`.

Default users:
- **admin** / **admin123** (role: admin)
- **engineer** / **admin123** (role: engineer)
- **operator** / **admin123** (role: operator)

⚠️ **Note:** Be sure to change the passwords in production!

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The Frontend is available at http://localhost:5173.

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:5000 | JWT Token required |
| **Frontend** | http://localhost:5173 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **MLflow** | http://localhost:5001 | - |
| **InfluxDB** | http://localhost:8086 | Token required |

## 🔐 Authentication

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Using the Token

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:5000/api/data/get_live_data \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Monitoring

### Prometheus Metrics

Metrics are available at:
- Backend: http://localhost:8000/metrics
- DVR Consumer: http://localhost:8000/metrics
- RTM Consumer: http://localhost:8000/metrics

### Grafana Dashboards

1. Log in to Grafana
2. Dashboards load automatically
3. System Overview and Data Quality dashboards are available

## 🔄 Workflow Example

### 1. Data Flow:
```
Sensor Data → Kafka (sensors-raw) → DVR Consumer → Kafka (sensors-validated) 
→ RTM Consumer → Anomaly Detection → Alerts
→ RTO Consumer → Optimization Suggestions → Digital Twin Validation
→ InfluxDB → API → Frontend
```

### 2. Control Action:
```
1. RTO generates suggestion
2. Engineer reviews and approves
3. Digital Twin validates
4. Action executed via OPC-UA
5. Audit trail logged
```

## 🧪 Testing

### Backend Tests:
```bash
pytest --cov=backend --cov-report=html
```

### Frontend Tests:
```bash
cd frontend
npm test
```

## 📝 Troubleshooting

### Problem: Kafka connection failed
```bash
# Check Kafka status
docker-compose ps kafka

# Check logs
docker-compose logs kafka
```

### Problem: Database connection error
```bash
# Check MySQL health
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
```

### Problem: Metrics not showing
- Check that the metrics server is running
- Port 8000 must be open
- The Prometheus config must be correct

## ✅ Verification Checklist

- [ ] All containers are running
- [ ] The Database is initialized
- [ ] Default users have been created
- [ ] Authentication works
- [ ] Metrics are visible in Prometheus
- [ ] Grafana dashboards load
- [ ] The MLflow UI is available
- [ ] Data flow works
- [ ] Tests pass

---

**The system is ready for use!** 🎉

