class RealTimeRecommender:
    def __init__(self):
        self.feature_names = [
            "Pressure_In", "Temperature_In", "Flow_Rate", "Efficiency",
            "Power_Consumption", "Vibration", "Ambient_Temperature", "Humidity",
            "Air_Pollution", "Maintenance_Quality", "Fuel_Quality", "Load_Factor"
        ]

        # مقادیر بهینه‌ی مستقیم
        optimal_values_list = [
            3.59856863, 309.985683, 12.1401897, 0.805693885,
            1167.33167, 0.989138419, 29.4701828, 48.3055544,
            0.038871951, 86.2335737, 93.3260745, 0.762086871
        ]

        self.optimal_values = dict(zip(self.feature_names, optimal_values_list))

    def recommend(self, current_input_list, tolerance=0.01):
        """
        دریافت ورودی فعلی به صورت لیست و پیشنهاد مقدار اصلاح برای نزدیک شدن به مقدار بهینه.
        tolerance: میزان حساسیت (درصدی که قابل چشم‌پوشی‌ست)
        """
        if len(current_input_list) != len(self.feature_names):
            raise ValueError("طول لیست ورودی باید برابر با تعداد ویژگی‌ها باشد.")

        recommendations = {}

        for i, current_value in enumerate(current_input_list):
            feature = self.feature_names[i]
            optimal = self.optimal_values[feature]
            deviation = current_value - optimal

            if abs(deviation) <= tolerance * abs(optimal):
                recommendations[feature] = "در محدوده بهینه"
            else:
                adjustment = -deviation
                recommendations[feature] = f"تغییر مقدار به: {current_value + adjustment:.4f} (اصلاح: {adjustment:+.4f})"

        return recommendations

    def report(self, current_input_list):
        print(" پیشنهادهای اصلاح بلادرنگ:")
        recs = self.recommend(current_input_list)
        for feature, suggestion in recs.items():
            print(f"- {feature}: {suggestion}")


# ✅ تست با ورودی از نوع لیست
if __name__ == "__main__":
    current_input_list = [
        3.45, 295, 12.5, 0.79, 1250,
        1.1, 27, 60, 0.06, 80,
        90, 0.77
    ]

    recommender = RealTimeRecommender()
    recommender.report(current_input_list)
