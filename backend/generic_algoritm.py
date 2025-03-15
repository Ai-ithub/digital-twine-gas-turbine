# نصب deap نیاز است

#کد اول
import numpy as np
import pandas as pd
from deap import base, creator, tools, algorithms

# خواندن داده‌ها
df = pd.read_csv("extended_compressor_data_with_timestamp.csv")

# حذف کلاس‌های قدیمی
if 'FitnessMax' in dir(creator):
    del creator.FitnessMax
if 'Individual' in dir(creator):
    del creator.Individual

# تعریف ویژگی‌ها
features = [
    'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out',
    'Temperature_Out', 'Efficiency', 'Power_Consumption', 'Vibration',
    'Ambient_Temperature', 'Humidity', 'Air_Pollution',
    'Startup_Shutdown_Cycles', 'Maintenance_Quality', 'Fuel_Quality',
    'Load_Factor'
]

# تعریف محدوده‌های مقادیر برای هر ویژگی
feature_bounds = {
    "Pressure_In": (3.0, 4.0),
    "Temperature_In": (280, 310),
    "Flow_Rate": (10, 15),
    "Pressure_Out": (min(df["Pressure_Out"]), max(df["Pressure_Out"])),
    "Temperature_Out": (min(df["Temperature_Out"]), max(df["Temperature_Out"])),
    "Efficiency": (0.75, 1.0),
    "Power_Consumption": (min(df["Power_Consumption"]), max(df["Power_Consumption"])),
    "Vibration": (0.5, 1.5),
    "Ambient_Temperature": (20, 40),
    "Humidity": (40, 80),
    "Air_Pollution": (0.01, 0.1),
    "Startup_Shutdown_Cycles": (0, max(df["Startup_Shutdown_Cycles"])),
    "Maintenance_Quality": (60, 100),
    "Fuel_Quality": (85, 100),
    "Load_Factor": (0.7, 1.0)
}

# تعریف تابع تناسب (Fitness Function)
def fitness_function(individual):
    feature_values = {features[i]: individual[i] for i in range(len(features))}
    score = 0
    
    if 3.2 < feature_values["Pressure_In"] < 3.8:
        score += 1
    if 285 < feature_values["Temperature_In"] < 300:
        score += 1
    if 11 < feature_values["Flow_Rate"] < 14:
        score += 1
    if feature_values["Pressure_Out"] < np.percentile(df["Pressure_Out"], 65):
        score += 1
    if feature_values["Temperature_Out"] < np.percentile(df["Temperature_Out"], 65):
        score += 1
    if feature_values["Efficiency"] > 0.80:
        score += 1
    if feature_values["Power_Consumption"] < np.percentile(df["Power_Consumption"], 65):
        score += 1
    if feature_values["Vibration"] < np.percentile(df["Vibration"], 65):
        score += 1
    if feature_values["Ambient_Temperature"] < 35:
        score += 1
    if feature_values["Humidity"] < 70:
        score += 1
    if feature_values["Air_Pollution"] < 0.08:
        score += 1
    if feature_values["Startup_Shutdown_Cycles"] < np.percentile(df["Startup_Shutdown_Cycles"], 65):
        score += 1
    if feature_values["Maintenance_Quality"] > 75:
        score += 1
    if feature_values["Fuel_Quality"] > 90:
        score += 1
    if feature_values["Load_Factor"] < 0.95:
        score += 1
    
    return score,

# تنظیمات DEAP
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()

for feature in features:
    toolbox.register(f"attr_{feature}", np.random.uniform, *feature_bounds[feature])

toolbox.register(
    "individual",
    tools.initCycle,
    creator.Individual,
    [getattr(toolbox, f"attr_{feature}") for feature in features],
    n=1
)

toolbox.register("population", tools.initRepeat, list, toolbox.individual)
toolbox.register("evaluate", fitness_function)
toolbox.register("mate", tools.cxBlend, alpha=0.5)
toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.1, indpb=0.2)
toolbox.register("select", tools.selTournament, tournsize=3)

# اجرای الگوریتم ژنتیک
def run_genetic_algorithm():
    population = toolbox.population(n=50)
    n_generations = 20
    cxpb, mutpb = 0.5, 0.2

    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("std", np.std)
    stats.register("min", np.min)
    stats.register("max", np.max)

    logbook = tools.Logbook()
    logbook.header = ["gen", "nevals"] + stats.fields

    for gen in range(n_generations):
        offspring = algorithms.varAnd(population, toolbox, cxpb, mutpb)
        fits = map(toolbox.evaluate, offspring)
        for fit, ind in zip(fits, offspring):
            ind.fitness.values = fit

        population = toolbox.select(offspring, k=len(population))

        record = stats.compile(population)
        logbook.record(gen=gen, nevals=len(offspring), **record)
        print(logbook.stream)

    best_individual = tools.selBest(population, k=1)[0]
    best_values = {features[i]: best_individual[i] for i in range(len(features))}
    return best_values

# اجرای الگوریتم و گرفتن مقادیر بهینه
optimal_values = run_genetic_algorithm()

# محدود کردن مقادیر به محدوده‌های تعیین‌شده
def clip_values(values, bounds):
    clipped_values = {}
    for feature, value in values.items():
        lower, upper = bounds[feature]
        clipped_values[feature] = max(lower, min(upper, value))
    return clipped_values

optimal_values = clip_values(optimal_values, feature_bounds)
print("\nمقادیر اپتیمال محدود شده برای هر ویژگی:")
for feature, value in optimal_values.items():
    print(f"{feature}: {value:.2f}")







#کد دوم
import numpy as np
import pandas as pd
import random
from deap import base, creator, tools, algorithms

# بارگذاری داده‌ها
df = pd.read_csv("extended_compressor_data_with_timestamp (1).csv")

# تعیین محدوده‌های نرمال برای همه ویژگی‌ها
feature_ranges = {
    "Pressure_In": (3.2, 3.8),
    "Temperature_In": (280, 310),
    "Flow_Rate": (11, 13),
    "Efficiency": (0.80, 0.85),
    "Power_Consumption": (1000, 1500),
    "Vibration": (0.8, 1.2),
    "Ambient_Temperature": (20, 30),
    "Humidity": (40, 60),
    "Air_Pollution": (0.02, 0.07),
    "Maintenance_Quality": (75, 90),
    "Fuel_Quality": (90, 100),
    "Load_Factor": (0.75, 0.85)
}

# فیلتر داده‌هایی که در وضعیت Fault هستند
fault_data = df[df["Status"] == "Fault"]

def fitness_function(individual, feature, normal_range):
    """محاسبه میزان انحراف از محدوده نرمال برای یک ترکیب مشخص از ورودی‌ها"""
    input_value = individual[0]
    error = max(0, normal_range[0] - input_value) + max(0, input_value - normal_range[1])
    return (1 / (1 + error),)

# تنظیمات الگوریتم ژنتیک
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)
toolbox = base.Toolbox()

def optimize_input(feature, normal_range):
    toolbox.register("attr_float", random.uniform, normal_range[0] - 1, normal_range[1] + 1)
    toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_float, n=1)
    toolbox.register("population", tools.initRepeat, list, toolbox.individual)
    toolbox.register("mate", tools.cxBlend, alpha=0.5)
    toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.1, indpb=0.2)
    toolbox.register("select", tools.selTournament, tournsize=3)
    toolbox.register("evaluate", lambda ind: fitness_function(ind, feature, normal_range))
    
    pop = toolbox.population(n=100)
    algorithms.eaSimple(pop, toolbox, cxpb=0.5, mutpb=0.2, ngen=50, verbose=False)
    best_individual = tools.selBest(pop, k=1)[0]
    return best_individual[0]

# بهینه‌سازی برای هر فیچر و ذخیره فقط یک مقدار اوپتیمال برای هر ویژگی
optimal_values = {feature: optimize_input(feature, normal_range) for feature, normal_range in feature_ranges.items()}

# ذخیره مقدارهای اوپتیمال در یک DataFrame و خروجی به CSV
optimal_df = pd.DataFrame([optimal_values])
optimal_df.to_csv("optimal_values.csv", index=False)
print("بهینه‌سازی انجام شد و مقدارهای اوپتیمال ذخیره شدند.")


