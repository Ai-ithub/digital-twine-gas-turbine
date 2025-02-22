import numpy as np
import pandas as pd
from scipy import stats
from scipy.integrate import solve_ivp
import great_expectations as ge

# ----------------------------
# ۱. تولید داده با معیارهای ISO
# ----------------------------
class CompressorDataGenerator:
    def __init__(self, num_samples=100000):
        self.num_samples = num_samples
        self.params = {
            'MW': 16.04,
            'gamma': 1.31,
            'R': 8.314 / 16.04,
            'vib_limits': (0.5, 4.5)
        }
    
    def _calc_thermodynamic(self):
        t = np.linspace(0, self.num_samples, self.num_samples)
        self.df = pd.DataFrame({
            'time': t,
            'P_in': 3.5 + 0.2 * np.sin(0.05 * t) + np.random.normal(0, 0.05, self.num_samples),
            'T_in': 293 + 5 * np.cos(0.03 * t) + np.random.normal(0, 1, self.num_samples),
            'flow': 12 + 0.5 * np.sin(0.04 * t) + np.random.normal(0, 0.1, self.num_samples)
        })
        self.df['P_ratio'] = 5.0 + 0.2 * np.sin(0.05 * t) + np.random.normal(0, 0.05, self.num_samples)
        self.df['T_out'] = self.df.T_in * (self.df.P_ratio ** ((self.params['gamma'] - 1) / (self.params['gamma'] * 0.82)))
        self.df['Power'] = np.maximum(
            self.df.flow * (self.params['gamma'] * self.params['R'] / (self.params['gamma'] - 1)) * (self.df.T_out - self.df.T_in) / 0.82, 0)

    def _add_vibration_model(self):
        def vibration_model(t, y):
            k, c, m = 10, 0.5, 1  # ثابت فنر، ضریب میرایی، جرم
            return [y[1], - (c / m) * y[1] - (k / m) * y[0] + np.sin(0.06 * t)]

        sol = solve_ivp(vibration_model, [0, self.num_samples], [0, 0], t_eval=np.arange(self.num_samples), method='RK45')
        self.df['Vibration'] = np.interp(self.df['time'], sol.t, sol.y[0])

    def generate(self):
        self._calc_thermodynamic()
        self._add_vibration_model()
        return self.df

# ----------------------------
# اجرای تولید داده
# ----------------------------
generator = CompressorDataGenerator()
df_sim = generator.generate()
df_sim['Status'] = pd.cut(df_sim.Vibration, bins=[0, 2, 4.5, np.inf], labels=['Normal', 'Imbalance', 'Fault'])
df_sim.to_csv('simulated_compressor_data.csv', index=False)

print("✅ داده‌های شبیه‌سازی‌شده با موفقیت تولید و ذخیره شدند.")