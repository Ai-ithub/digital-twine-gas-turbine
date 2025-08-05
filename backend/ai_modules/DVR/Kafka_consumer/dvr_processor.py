import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import statsmodels.api as sm
from scipy import stats

class DVRProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.pca = PCA()

    def apply_rule_based_checks(self, df):
        """
        Applies rule-based validation on physical ranges and rate-of-change.
        Adds boolean columns for each rule and overall pass/fail flags.
        """
        # Pointwise physical limits
        df['rule_pressure_in'] = df['Pressure_In'].between(3.0, 4.0)
        df['rule_temperature_in'] = df['Temperature_In'].between(10, 30)
        df['rule_flow_rate'] = df['Flow_Rate'].between(11.0, 13.0)
        df['rule_pressure_diff'] = (df['Pressure_Out'] - df['Pressure_In']).between(12, 16)
        df['rule_efficiency'] = df['Efficiency'].between(0, 1)
        df['rule_vibration'] = df['Vibration'].between(0.5, 1.3)
        df['rule_ambient_temp'] = df['Ambient_Temperature'].between(15, 35)
        df['rule_power'] = df['Power_Consumption'].between(4000, 7000)

        # Rate-of-change rules using diff
        df['delta_temperature'] = df['Temperature_In'].diff().abs()
        df['delta_vibration'] = df['Vibration'].diff().abs()
        df['delta_pressure'] = df['Pressure_In'].diff().abs()

        df['rule_temp_roc'] = df['delta_temperature'] < 2.5
        df['rule_vib_roc'] = df['delta_vibration'] < 0.15
        df['rule_pressure_roc'] = df['delta_pressure'] < 0.3

        # Handle first row with NaN diffs
        df[['rule_temp_roc', 'rule_vib_roc', 'rule_pressure_roc']] = \
            df[['rule_temp_roc', 'rule_vib_roc', 'rule_pressure_roc']].fillna(True)

        # Combine all boolean rule checks
        rule_cols = [col for col in df.columns if col.startswith('rule_')]
        df['all_rules_pass'] = df[rule_cols].all(axis=1)
        df['rule_violation_flag'] = ~df['all_rules_pass']

        return df

    def apply_pca_check(self, df):
        """
        Applies PCA-based anomaly detection based on reconstruction error.
        Adds 'Reconstruction_Error' and 'Gross_Error' columns.
        """
        df_clean = df.dropna()
        features = df_clean.select_dtypes(include=[np.number])
        if features.empty:
            df['Reconstruction_Error'] = np.nan
            df['Gross_Error'] = False
            return df

        X_scaled = self.scaler.fit_transform(features)
        self.pca.fit(X_scaled)
        X_pca = self.pca.transform(X_scaled)
        X_reconstructed = self.pca.inverse_transform(X_pca)
        reconstruction_error = np.mean((X_scaled - X_reconstructed) ** 2, axis=1)

        df.loc[df_clean.index, 'Reconstruction_Error'] = reconstruction_error
        threshold = np.percentile(reconstruction_error, 95)
        
        df['Gross_Error'] = False
        df.loc[df_clean.index, 'Gross_Error'] = reconstruction_error > threshold


        return df

    def apply_grubbs_test(self, df, column='Temperature_In', alpha=0.05):
        """
        Detects outliers in a specific column using Grubbs' test.
        Adds 'Grubbs_Outlier' column.
        """
        data = df[column].dropna().values
        mask = np.ones(len(data), dtype=bool)
        while True:
            current_data = data[mask]
            if len(current_data) < 3:
                break
            mean = np.mean(current_data)
            std = np.std(current_data, ddof=1)
            diffs = np.abs(current_data - mean)
            max_idx = np.argmax(diffs)
            G = diffs[max_idx] / std
            t_crit = stats.t.ppf(1 - alpha / (2 * len(current_data)), df=len(current_data) - 2)
            G_crit = ((len(current_data) - 1) / np.sqrt(len(current_data))) * \
                     np.sqrt(t_crit ** 2 / (len(current_data) - 2 + t_crit ** 2))
            if G > G_crit:
                mask[np.where(mask)[0][max_idx]] = False
            else:
                break
        df['Grubbs_Outlier'] = True
        df.loc[df[column].dropna().index[mask], 'Grubbs_Outlier'] = False
        return df

    def apply_wls_model(self, df):
        """
        Fits a WLS model to predict Power_Consumption (used for diagnostics).
        """
        df = df.dropna()
        X = df[['Pressure_In', 'Temperature_In', 'Flow_Rate', 'Efficiency']]
        y = df['Power_Consumption']
        X = sm.add_constant(X)
        residual_std = y.rolling(10).std().bfill()
        weights = 1 / (residual_std ** 2)
        model = sm.WLS(y, X, weights=weights)
        return model.fit()

    def run_all_checks(self, df):
        """
        Runs all DVR validation steps and enriches the DataFrame.
        """
        df = self.apply_rule_based_checks(df)
        df = self.apply_pca_check(df)
        df = self.apply_grubbs_test(df)
        return df
