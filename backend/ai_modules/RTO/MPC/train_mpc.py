
import casadi as ca
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
import joblib

# -------- Load Dataset --------
df = pd.read_csv("C:/Users/98939/Downloads/MASTER_DATASET.csv")

# States: Efficiency, Power_Consumption
# Control: Flow_Rate_Filtered
states = df[['Efficiency', 'Power_Consumption']].values
control_input = df['Flow_Rate_Filtered'].values

# Prepare data for system identification
X = np.hstack([states[:-1], control_input[:-1].reshape(-1,1)])  
Y = states[1:]  

data = np.hstack([X, Y])
data_df = pd.DataFrame(data).dropna()

X_clean = data_df.iloc[:, :X.shape[1]].values
Y_clean = data_df.iloc[:, X.shape[1]:].values

# -------- Fit Linear Regression for A, B --------
model = LinearRegression()
model.fit(X_clean, Y_clean)

AB = model.coef_  
A = AB[:, :states.shape[1]]
B = AB[:, states.shape[1]:]

# -------- Scaling (Optional for numerical stability) --------
state_scaler = MinMaxScaler()
input_scaler = MinMaxScaler()

state_scaler.fit(states)
input_scaler.fit(control_input.reshape(-1, 1))

# -------- MPC Parameters --------
mpc_config = {
    "A": A,
    "B": B,
    "Q": np.eye(A.shape[0]) * 1.0,
    "R": np.eye(B.shape[1]) * 0.01,
    "N": 10  # horizon
}

# -------- Save Everything --------
joblib.dump(A, "mpc_A.pkl")
joblib.dump(B, "mpc_B.pkl")
joblib.dump(state_scaler, "mpc_state_scaler.pkl")
joblib.dump(input_scaler, "mpc_input_scaler.pkl")
joblib.dump(mpc_config, "mpc_config.pkl")

print("MPC model saved successfully!")
