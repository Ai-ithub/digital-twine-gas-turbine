import random
import time
import threading
import sys
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

try:
    import winsound
except ImportError:
    winsound = None


def generate_sensor_data():
    temp = random.normalvariate(70, 2)
    pressure = random.normalvariate(30, 1)
    vibration = random.normalvariate(5, 0.5)
    return temp, pressure, vibration


def play_alert():
    if sys.platform == 'win32' and winsound:
        winsound.Beep(1000, 500)
    else:
        print("\a")  # Fallback beep


class LiveMonitor:
    def __init__(self):
        self.data = []
        self.model = IsolationForest(contamination=0.05)
        self.window_size = 20
        self.last_alert_time = 0
        self.setup_plots()

    def setup_plots(self):
        plt.ion()
        self.fig, self.axs = plt.subplots(3, 1, figsize=(10, 8))
        self.fig.subplots_adjust(hspace=0.5)
        self.lines = []
        self.upper_lines = []
        self.lower_lines = []

        for ax, column in zip(self.axs, ["Temp", "Pressure", "Vibration"]):
            line, = ax.plot([], [], 'b-', label=column)
            self.lines.append(line)
            ax.set_ylabel(column)
            ax.set_title(f"{column} Monitoring")
            ax.grid(True)
            ax.legend()
            ax.anomaly_points = []


            upper_line = ax.axhline(0, color='r', linestyle='--', alpha=0.3)
            lower_line = ax.axhline(0, color='r', linestyle='--', alpha=0.3)
            self.upper_lines.append(upper_line)
            self.lower_lines.append(lower_line)

        plt.show(block=False)
        plt.pause(0.1)

    def update_plots(self, df, anomalies):
        for i, (ax, line) in enumerate(zip(self.axs, self.lines)):
            column = df.columns[i]
            line.set_data(range(len(df)), df[column])

            upper = df[column].mean() + 3 * df[column].std()
            lower = df[column].mean() - 3 * df[column].std()

            # update .
            self.upper_lines[i].set_ydata([upper] * len(df))
            self.lower_lines[i].set_ydata([lower] * len(df))

            # delet e ghabli
            for point in ax.anomaly_points:
                point.remove()
            ax.anomaly_points = []

            # noghte jadid
            if not anomalies.empty:
                points = ax.plot(anomalies.index, anomalies[column], 'ro')
                ax.anomaly_points.extend(points)

            ax.relim()
            ax.autoscale_view()

    def run(self):
        try:
            while True:
                new_data = generate_sensor_data()
                self.data.append(new_data)

                # jologiri az por shodan hafeze
                if len(self.data) > 1000:
                    self.data = self.data[-1000:]

                if len(self.data) >= self.window_size:
                    df = pd.DataFrame(self.data[-self.window_size:], columns=["Temp", "Pressure", "Vibration"])
                    self.model.fit(df)
                    pred = self.model.predict(df)
                    anomalies = df[pred == -1]

                    self.update_plots(df, anomalies)

                    if not anomalies.empty and time.time() - self.last_alert_time > 2:
                        threading.Thread(target=play_alert).start()
                        self.last_alert_time = time.time()

                    self.fig.canvas.draw()
                    self.fig.canvas.flush_events()

                time.sleep(1)

        except KeyboardInterrupt:
            print("\n[!] Monitoring stopped.")
        finally:
            plt.ioff()
            plt.close()


if __name__ == "__main__":
    print("Program started - Press Ctrl+C to stop.")
    monitor = LiveMonitor()
    monitor.run()
