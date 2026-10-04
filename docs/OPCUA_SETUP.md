# OPC-UA Client Setup Guide

This guide describes how to configure and use the OPC-UA Client.

## 📋 Prerequisites

- OPC-UA Server (SCADA/PLC system)
- Python OPC-UA libraries (asyncua, opcua)

## 🔧 Configuring Environment Variables

Add to the `.env` file:

```env
# OPC-UA Server Configuration
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=opcua_user
OPCUA_PASSWORD=opcua_password

# Node IDs (configure based on your OPC-UA server structure)
OPCUA_NODE_LOAD_FACTOR=ns=2;s=LoadFactor
OPCUA_NODE_PRESSURE_SETPOINT=ns=2;s=PressureSetpoint
OPCUA_NODE_TEMPERATURE_SETPOINT=ns=2;s=TemperatureSetpoint
OPCUA_NODE_SYSTEM_STATUS=ns=2;s=SystemStatus
```

## 🔐 Security Configuration (NF-414)

According to requirement NF-414, the OPC-UA connection must:
- Use **Unique credentials** for RTO control
- Have **Restricted permissions**
- Be **Isolated** from other connections

For this purpose:
1. Create a separate OPC-UA user for RTO
2. Give only read/write permissions for the control nodes
3. Keep these credentials in `.env` (not in code)

## 🚀 Usage

### 1. Propose Control Change

```python
POST /api/control/settings
Authorization: Bearer <token>

{
    "parameter": "load_factor",
    "current_value": 0.75,
    "proposed_value": 0.85,
    "reason": "Optimization based on RTO analysis"
}
```

### 2. Approve Action (Engineer Only)

```python
POST /api/control/actions/{action_id}/approve
Authorization: Bearer <engineer_token>
```

### 3. Execute Action

```python
POST /api/control/actions/{action_id}/execute
Authorization: Bearer <engineer_token>
```

## 🔄 Closed-Loop Control Workflow (FR-343)

1. **RTO Suggestion** → The RTO module provides an optimization suggestion
2. **Propose Action** → The system proposes a control action
3. **Engineer Approval** → The engineer reviews and approves the action
4. **Execute** → The action is executed through OPC-UA
5. **Monitor** → The results are monitored

## 📝 Integration with RTO

To integrate RTO with OPC-UA:

```python
from backend.opcua.opcua_client import OPCUAClient, OPCUAControlExecutor

# In the RTO consumer, after generating a suggestion:
executor = OPCUAControlExecutor(OPCUAClient())
action = await executor.propose_control_action(
    action_id=generate_uuid(),
    parameter="load_factor",
    current_value=current_load,
    proposed_value=suggested_load,
    reason="RTO optimization suggestion"
)
```

## ⚠️ Security Notes

1. **Credentials:**
   - Never hard-code credentials in code
   - Use environment variables or secret management

2. **Network Security:**
   - The OPC-UA connection must be on an isolated network
   - Use a VPN or firewall rules

3. **Access Control:**
   - Only engineers and admins can approve/execute actions
   - All actions are logged

## 🧪 Testing

To test the OPC-UA connection:

```python
from backend.opcua.opcua_client import OPCUAClient

client = OPCUAClient()
connected = await client.connect()
if connected:
    params = await client.read_control_parameters()
    print(f"Connected! Parameters: {params}")
```

## 🐛 Troubleshooting

### Problem: "Cannot connect to OPC-UA server"
- Check that the OPC-UA server is running
- Check the Endpoint URL
- Check the Firewall rules

### Problem: "Authentication failed"
- Check the Username/password
- Make sure the user exists on the OPC-UA server

### Problem: "Node not found"
- Check the Node IDs
- Check the OPC-UA server structure by browsing

