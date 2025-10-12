
# **Software Requirements Specification (SRS) – Industrial Gas Turbine Compressor Dashboard**
**Version:** **4.0 (IP-Compliant & Closed-Loop Control)**

---

## **1. Introduction**

### **1.1 Purpose**
This document defines the software requirements for the **Industrial Gas Turbine Compressor (IGT-12MW Class) Dashboard**, a modern, web-based system for real-time monitoring, predictive maintenance, and closed-loop optimization of industrial compressors using AI and advanced analytics.

### **1.2 Scope**
The system includes:
- **Real-time Monitoring (RTM)** with Anomaly Detection.
- **Predictive Maintenance (PdM)** forecasting failures.
- **Data Validation & Reconciliation (DVR)** for sensor accuracy.
- **Real-Time Optimization (RTO)** with **Direct Closed-Loop Control**.
- A **React.js**-based UI with a **FastAPI/Flask** backend and **Kafka-centric** data pipeline.
- Comprehensive **Security**, **DevOps**, and **MLOps** requirements.

### **1.3 Definitions & Acronyms**
| Term | Definition |
| :--- | :--- |
| **IGT-12MW Class** | A generic industrial gas turbine compressor with operational parameters similar to the 12-15 MW class. |
| **RTO** | Real-Time Optimization (Dynamic parameter adjustment). |
| **Closed-Loop** | System automatically executes RTO suggestions (Direct Control). |
| **RTM** | Real-Time Monitoring (Anomaly detection). |
| **PdM** | Predictive Maintenance (Failure forecasting). |
| **CI/CD** | Continuous Integration/Continuous Deployment. |
| **WLS** | Weighted Least Squares (DVR Algorithm). |

### **1.4 IGT-12MW Class Operational Profile (Generic Specifications)**
The system's functional scope (RTM, PdM, RTO) **shall** be based on the following general operational characteristics typical of a twin-shaft gas turbine compressor in the 12-15 MW power class:

| Parameter | Specification | Purpose |
| :--- | :--- | :--- |
| **Power Output** | $\approx 12 - 15 \text{ MW}$ (Mechanical Drive) | Defines the load range for RTO. |
| **Compressor Stages**| 11-Stage Axial Compressor | Basis for PdM models (Blade/Bearing life). |
| **Pressure Ratio** | $\approx 16:1 \text{ to } 18:1$ | Critical RTO/Surge control parameter. |
| **Turbine Speed** | $\approx 9,500 - 12,000 \text{ rpm}$ | Key vibration and RUL input. |
| **Combustion Type** | Dry Low Emissions (DLE) | Implies control over NOx/CO emissions (RTO constraint). |
| **Key Sensors** | Pressure, Temperature, Vibration (Axial/Radial), Fuel Flow, Exhaust Temp. | Defines the raw data streams. |

---

## **2. Overall Description & Architecture**

### **2.1 System Overview**
The dashboard operates on a modern, streaming architecture, currently utilizing **Generated Data** (synthetic, near-realistic data) for development, with a clear path to integrate **Real Sensor Data**. The primary innovation is the implementation of AI-driven optimization with **Direct Control (Closed-Loop RTO)** authority.

### **2.2 Data Segmentation & Extensibility**
The system data must be segmented to ensure proper governance and model training.

| Data Segment | Description | Storage/Purpose |
| :--- | :--- | :--- |
| **Sensor Data (Raw/Validated)** | High-frequency time-series data from physical or simulated sensors. | **InfluxDB** (Time-Series) |
| **Historical Data** | Processed, aggregated data for long-term trends and reporting. | **MySQL/S3** (Warehouse) |
| **Generated Data** | The **synthetic data** currently used for model training and system validation. | Separate Kafka Topic/S3 (For Development/Testing) |

**FR-231 (Extensibility):** The system **shall** incorporate a configurable interface (e.g., via FastAPI and configuration files) allowing new compressor units or external data sources (e.g., different OPC-UA tags, new MQTT brokers) to be added and mapped to the Kafka pipeline with schema enforcement, minimizing code changes.

---

## **3. Functional Requirements**

### **3.1 Real-Time Monitoring (RTM)**
- **FR-311:** Display live Sensor Data (Pressure, Temp, Vibration) with $\le 1$ second latency.
- **FR-312:** Detect anomalies using Machine Learning (e.g., Isolation Forest) and Statistical Methods (e.g., Shewhart control charts).
- **FR-313:** Generate visual and audible alerts for threshold breaches and detected anomalies.

### **3.2 Predictive Maintenance (PdM)**
- **FR-321:** Forecast **Remaining Useful Life (RUL)** for critical components (e.g., turbine bearings, hot section blades) using time-series models (LSTM, Transformer networks) and Survival Analysis.
- **FR-322:** Provide actionable maintenance recommendations (e.g., "Schedule bearing replacement within the next 14 days").

### **3.3 Data Validation & Reconciliation (DVR)**
- **FR-331:** Detect faulty sensors (e.g., using PCA-based gross error detection, Grubbs’ test for outliers).
- **FR-332:** Reconcile data via **Weighted Least Squares (WLS)** and publish the corrected stream to the `sensors-validated` Kafka topic.

### **3.4 Real-Time Optimization (RTO) – Direct Control**
- **FR-341:** Calculate and suggest optimal compressor settings (e.g., Variable Inlet Guide Vane position) using **Model Predictive Control (MPC)** and Reinforcement Learning (RL) agents.
- **FR-342 (Direct Control):** The RTO module **shall** transmit the optimal parameter set directly to the SCADA system via a secured **OPC-UA Client** connection, executing the change in a **Closed-Loop** manner.
- **FR-343 (Authorization):** A secure **4-eyes principle** (Manager/Engineer approval) **shall** be enforced in the UI before activating or manually overriding the closed-loop RTO mechanism.
- **FR-344:** All RTO execution events, parameter changes, and control feedback must be logged in the Historical Data segment for auditability.

---

## **4. Non-Functional Requirements**

### **4.1 Security (Comprehensive)**
| Requirement | Description |
| :--- | :--- |
| **NF-411 (Application Security)** | Implement **JWT** for API authentication and **Role-Based Access Control (RBAC)** (Operator, Engineer, Manager) for UI/API access. |
| **NF-412 (Kafka In-Transit)** | The Kafka cluster **shall** implement **SSL/TLS** encryption for all data communication between producers, brokers, and consumers. |
| **NF-413 (Kafka Authentication)** | Use **SASL/SCRAM** for strong authentication of all services connecting to the Kafka brokers. |
| **NF-414 (Access Control)** | **Access Control Lists (ACLs)** **shall** be configured on all Kafka topics to enforce least-privilege access for each service. |
| **NF-415 (Control Isolation)** | Direct control (Closed-Loop RTO) communication via OPC-UA **shall** use unique, restricted user credentials/certificates for industrial network isolation. |

### **4.2 Development & Quality Assurance (Testing)**
| Requirement | Description |
| :--- | :--- |
| **NF-421 (Unit Testing)** | All backend (FastAPI/ML logic) and frontend (React components) code **shall** have mandatory **Unit Tests** with minimum **85% code coverage**. |
| **NF-422 (Integration Testing)** | Automated tests **shall** validate the end-to-end data flow (Producer $\to$ Kafka $\to$ DVR $\to$ RTO $\to$ Database). |
| **NF-423 (Performance Testing)** | The system must maintain consumer lag $<1$ second and API latency $<500$ milliseconds at peak load ($\ge 10,000 \text{ msgs/sec}$). |

### **4.3 Maintainability & DevOps/MLOps**
| Requirement | Description |
| :--- | :--- |
| **NF-431 (CI/CD)** | Implement a **CI/CD pipeline** (using GitLab/GitHub Actions) for automated building (Docker), testing, and deployment (Kubernetes) of all microservices. |
| **NF-432 (MLOps - Tracking)** | Use **MLflow** for robust version control of all AI models, hyperparameters, and the specific training datasets (including **Generated Data** versions). |
| **NF-433 (MLOps - Explainability)** | Provide **SHAP plots** and feature importance metrics for PdM and RTO models to support engineer validation. |
| **NF-434 (Monitoring)** | Implement comprehensive observability via **Prometheus/Grafana** to monitor: 1) Infrastructure Health, 2) Kafka Consumer Lag, and 3) **Model/Data Drift** for AI services. |

---

## **5. Technical Implementation**

### **5.1 UI/UX (Frontend Modernization)**
- **Platform:** **React.js** (Mandatory replacement for any legacy HMI, including LabVIEW).
- **Styling:** Mobile-responsive design using Tailwind CSS.
- **Visualization:** Plotly/Dash or D3.js for interactive rendering of time-series and AI results.

### **5.2 Data Pipeline & Backend**
- **Backend/API Gateway:** Python **FastAPI** (for high-performance data serving and ML inference).
- **Streaming:** **Apache Kafka** (3-node cluster, JSON data format with Schema Registry).
- **Stream Processing:** Kafka Streams or PySpark for RTM and DVR logic.

### **5.3 AI/ML Tools**
| Module | Algorithms | Core Tools |
| :--- | :--- | :--- |
| **RTM** | Isolation Forest, Shewhart Charts | `Scikit-learn`, `Statsmodels` |
| **PdM** | LSTM, Transformer, Survival Analysis | `TensorFlow`, `PyMC3` |
| **RTO** | MPC, Reinforcement Learning (DDPG/PPO) | `PyTorch`, `CasADi` |
| **Deployment**| Model Serving via **Kubernetes (KServe)** and **MLflow**. | |

---

## **6. Future Roadmap**
- **Digital Twin Integration:** Physics-based simulation for RTO validation and **Simulated Training** for RL agents.
- **Edge AI Deployment:** Implementing ONNX models on edge devices for RTM at the source.
- **SCADA Integration:** Implementing full **OPC-UA Server** for deeper integration and control.
