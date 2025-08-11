-- init/init.sql

-- THE FIX: Explicitly create the application user and grant permissions from any host ('%').
-- Make sure to replace 'your_strong_app_password_here' with the actual password from your .env file.
CREATE USER 'app_user'@'%' IDENTIFIED BY 'Ali23880rez@';
GRANT ALL PRIVILEGES ON compressor_db.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Switch to the target database
USE compressor_db;

-- Create the main data table
CREATE TABLE IF NOT EXISTS compressor_data (
    -- ... (تمام ستون‌ها مثل قبل، بدون تغییر)
    `Time` INT PRIMARY KEY,
    `Device_ID` VARCHAR(20),
    `Pressure_In` FLOAT,
    `Temperature_In` FLOAT,
    `Flow_Rate` FLOAT,
    `Pressure_Out` FLOAT,
    `Temperature_Out` FLOAT,
    `Efficiency` FLOAT,
    `Power_Consumption` FLOAT,
    `Vibration` FLOAT,
    `Status` VARCHAR(50),
    `Frequency` FLOAT,
    `Amplitude` FLOAT,
    `Phase_Angle` FLOAT,
    `Mass` FLOAT,
    `Stiffness` FLOAT,
    `Damping` FLOAT,
    `Density` FLOAT,
    `Velocity` FLOAT,
    `Viscosity` FLOAT,
    `Ambient_Temperature` FLOAT,
    `Humidity` FLOAT,
    `Air_Pollution` FLOAT,
    `Fuel_Quality` FLOAT,
    `Load_Factor` FLOAT,
    `Maintenance_Quality` FLOAT,
    `vib_std` FLOAT,
    `vib_max` FLOAT,
    `vib_mean` FLOAT,
    `vib_min` FLOAT,
    `vib_rms` FLOAT
);