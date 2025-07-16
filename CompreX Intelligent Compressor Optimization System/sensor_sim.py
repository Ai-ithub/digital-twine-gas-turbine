import random

def generate_sensor_data():

    pressure = random.normalvariate(30, 1)         # bar
    temperature = random.normalvariate(70, 2)      # °C
    flow_rate = random.normalvariate(100, 5)       # m3/h
    vibration = random.normalvariate(0.5, 0.1)     # mm/s

    return pressure, temperature, flow_rate, vibration


if __name__ == "__main__":
    for _ in range(5):
        print(generate_sensor_data())

