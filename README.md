# Software Requirements Specification (SRS)

**Project:** SGT-400 Compressor Dashboard  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the software requirements for the “SGT-400 Compressor Dashboard” system. This system is designed to monitor the real-time status of the SGT-400 compressor and predict key operational parameters using AI models.

### 1.2 Scope
The project involves the development of a web-based, data-driven dashboard for monitoring and forecasting the condition of the SGT-400 compressor. It provides:

- A responsive user interface using **LabVIEW**
- A backend API developed with **Flask**
- Integration of AI models for time-series prediction of key parameters
- Data storage for both real-time and predicted sensor values

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
|------|------------|
| SGT-400 | Industrial gas turbine compressor |
| API | Application Programming Interface |
| AI | Artificial Intelligence |
| UI | User Interface |
| UX | User Experience |
| LSTM | Long Short-Term Memory (a type of neural network for time series) |

---

## 2. Overall Description

### 2.1 System Overview
The system provides an interactive dashboard that monitors and visualizes real-time compressor data and uses AI models to forecast critical metrics such as temperature, pressure, and vibration.

### 2.2 Product Functions
- Real-time data visualization via interactive charts
- Forecasting of compressor parameters using AI models
- Anomaly detection and alerting
- Historical data filtering and retrieval
- Secure user access and API integration

### 2.3 User Classes and Characteristics
- **Operators:** Monitor live compressor performance
- **Engineers:** Analyze performance trends and diagnostics
- **Managers:** View summarized reports and receive alerts
- **Data Analysts:** Work with historical and predictive data

---

## 3. Functional Requirements

### 3.1 Real-Time Sensor Visualization
- Display incoming sensor data such as:
  - Inlet/Outlet temperature
  - Inlet/Outlet pressure
  - Vibration
  - Power consumption
- Update charts in near real-time

### 3.2 Predictive Analytics
- Use trained models (e.g., LSTM) to forecast future values
- Plot predicted values alongside real-time data

### 3.3 Alert System
- Generate alerts if thresholds are crossed
- Visual and audible indicators in UI

### 3.4 Historical Data Access
- Users can view past data using time filters
- Support data export as CSV or JSON

### 3.5 Data Persistence
- Store raw and predicted data in a structured database
- Ensure data retention policies are applied

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Real-time updates must occur with 1 seconds latency
- Backend must support up to 10 concurrent users

### 4.2 Usability
- Clean, modern UI using Tailwind CSS
- Mobile and desktop responsive design

### 4.3 Security
- User authentication (JWT)
- Role-based access control (Admin, Viewer, Analyst)

### 4.4 Maintainability
- Modular and documented code
- Support for unit and integration testing

### 4.5 Scalability
- Should support additional compressors in future deployments

---

## 5. External Interface Requirements

### 5.1 User Interface
- Built with **LabVIEW**

### 5.2 Hardware Interfaces
- None directly; assumes data is provided via a secure stream or API

### 5.3 Software Interfaces
- Database: MySQL

---

## 6. Artificial Intelligence Requirements

### 6.1 Model Types
- LSTM or GRU for time-series forecasting
- Isolation Forest or LOF for anomaly detection

### 6.2 Input Data
- Historical sensor data: temperature, pressure, vibration, etc.
- External features: ambient temperature, humidity

### 6.3 Model Serving
- Trained models serialized with `pickle` or `joblib`
- Deployed via Flask API routes

---

## 7. Design Constraints

- Use only open-source tools and libraries
- Dashboard must follow REST API design principles
- Must support future multi-language UI (i18n-ready)

---

## 8. Future Enhancements (Optional)

- Support for multiple compressors on one dashboard
- Predictive maintenance scheduling
- Integration with SCADA systems

