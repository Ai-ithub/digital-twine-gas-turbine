import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from scipy import stats

class DVRProcessor:
    def __init__(self, rules_config=None):
        """
        Initialize DVRProcessor with optional rule-based config.
        :param rules_config: dict containing thresholds for sensors
        """
        self.rules_config = rules_config or {}

    def rule_based_check(self, df):
        """
        Apply rule-based filtering on the data.
        Remove or mark sensor values that are out of expected range.
        """
        for column, (min_val, max_val) in self.rules_config.items():
            df[column] = df[column].where((df[column] >= min_val) & (df[column] <= max_val), np.nan)
        return df

    def apply_pca(self, df, n_components=0.95):
        """
        Apply PCA to detect deviations in sensor patterns.
        """
        df_clean = df.dropna(axis=1, how='any')  # Drop sensors with NaN
        if df_clean.empty or df_clean.shape[1] < 2 or df_clean.shape[0] < 2:
            return df  # Not enough data for PCA
    
        try:
            pca = PCA(n_components=n_components)
            pca.fit(df_clean)
            reconstructed = pca.inverse_transform(pca.transform(df_clean))
            reconstruction_error = np.abs(df_clean - reconstructed)
            outlier_mask = (reconstruction_error > reconstruction_error.mean() + 2 * reconstruction_error.std())
            df[df_clean.columns] = df_clean.mask(outlier_mask)
        except Exception as e:
            print(f"PCA failed: {e}")
    
        return df

    def grubbs_test(self, df, alpha=0.05):
        """
        Apply Grubbs' Test on each column to detect outliers.
        """
        for col in df.columns:
            series = df[col].dropna()
            if len(series) < 3:
                continue
            test = True
            while test:
                n = len(series)
                mean = series.mean()
                std = series.std()
                G = abs(series - mean).max() / std
                t_crit = stats.t.ppf(1 - alpha / (2 * n), n - 2)
                G_crit = ((n - 1) / np.sqrt(n)) * np.sqrt(t_crit**2 / (n - 2 + t_crit**2))
                if G > G_crit:
                    series = series[series != abs(series - mean).idxmax()]
                else:
                    test = False
            df[col] = df[col].where(df[col].isin(series))
        return df

    def weighted_least_squares(self, df):
        """
        Replace missing or faulty values using Weighted Least Squares.
        """
        df_filled = df.copy()
        for col in df.columns:
            y = df[col]
            X = df.drop(columns=col)
            mask = y.notna()
            if mask.sum() < 3:
                continue
            try:
                # Solve WLS using pseudoinverse
                weights = np.ones_like(y[mask])
                beta = np.linalg.pinv(X[mask].values) @ y[mask].values
                y_pred = X.values @ beta
                y[~mask] = y_pred[~mask]
                df_filled[col] = y
            except Exception as e:
                print(f"WLS failed for {col}: {e}")
        return df_filled

    def process(self, df):
        """
        Full pipeline to clean and validate raw sensor data.
        """
        df = self.rule_based_check(df)
        df = self.apply_pca(df)
        df = self.grubbs_test(df)
        df = self.weighted_least_squares(df)
        return df