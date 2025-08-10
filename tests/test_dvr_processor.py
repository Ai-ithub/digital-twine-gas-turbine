import pytest
import pandas as pd
import numpy as np

# ماژولی که می‌خواهیم تست کنیم را وارد می‌کنیم
# مسیر را بر اساس ساختار پروژه خود تنظیم کنید
from ml.dvr_processor import DVRProcessor

@pytest.fixture
def dvr_processor() -> DVRProcessor:
    """
    A pytest fixture to provide a fresh instance of DVRProcessor for each test.
    """
    return DVRProcessor()

@pytest.fixture
def sample_batch_data() -> pd.DataFrame:
    """
    Provides a sample DataFrame with 5 rows of data for testing.
    """
    data = {
        'Pressure_In': [3.5, 3.6, 3.55, 3.65, 3.7],
        'Temperature_In': [20, 21, 22, 21.5, 22.5],
        'Flow_Rate': [12.0, 12.1, 12.2, 12.0, 12.3],
        'Pressure_Out': [17, 17.2, 17.1, 17.3, 17.5],
        'Efficiency': [0.85, 0.86, 0.85, 0.87, 0.84],
        'Vibration': [0.9, 0.95, 1.0, 1.1, 0.98],
        'Ambient_Temperature': [25, 26, 25.5, 26.5, 27],
        'Power_Consumption': [5500, 5600, 5550, 5650, 5700]
    }
    return pd.DataFrame(data)

# --- اولین تست کیس ما ---
def test_valid_data_should_pass_all_rules(dvr_processor, sample_batch_data):
    """
    Tests the "happy path" scenario where all data is valid and should pass
    all rule-based checks.
    """
    # 1. Arrange (آماده‌سازی)
    valid_data = sample_batch_data
    
    # 2. Act (اجرای عملیات)
    processed_df = dvr_processor.apply_rule_based_checks(valid_data)
    
    # 3. Assert (بررسی نتیجه)
    # همه مقادیر در ستون 'all_rules_pass' باید True باشند
    assert processed_df['all_rules_pass'].all()
    # هیچ مقداری در ستون 'rule_violation_flag' نباید True باشد
    assert not processed_df['rule_violation_flag'].any()
    
    # --- دومین تست کیس ما ---
def test_invalid_pressure_data_should_fail_rules(dvr_processor, sample_batch_data):
    """
    Tests that a row with an out-of-range physical value correctly fails
    the rule-based checks.
    """
    # 1. Arrange (آماده‌سازی)
    # یک کپی از داده‌های سالم را برمی‌داریم
    invalid_data = sample_batch_data.copy()
    
    # یک مقدار خارج از بازه مجاز برای فشار در ردیف سوم قرار می‌دهیم
    # بازه مجاز بین 3.0 و 4.0 است، ما 10.0 را قرار می‌دهیم
    invalid_row_index = 2
    invalid_data.loc[invalid_row_index, 'Pressure_In'] = 10.0

    # 2. Act (اجرای عملیات)
    processed_df = dvr_processor.apply_rule_based_checks(invalid_data)
    
    # 3. Assert (بررسی نتیجه)
    # انتظار داریم که فلگ کلی برای ردیف نامعتبر، False باشد
    assert not processed_df.loc[invalid_row_index, 'all_rules_pass']
    
    # انتظار داریم که فلگ نقض قانون برای آن ردیف، True باشد
    assert processed_df.loc[invalid_row_index, 'rule_violation_flag']
    
    # به طور مشخص، انتظار داریم که قانون مربوط به فشار برای آن ردیف، False باشد
    assert not processed_df.loc[invalid_row_index, 'rule_pressure_in']
    
    # --- سومین تست کیس ما ---
def test_invalid_roc_data_should_fail_rules(dvr_processor, sample_batch_data):
    """
    Tests that a row with an invalid rate-of-change correctly fails the
    rule-based checks.
    """
    # 1. Arrange
    invalid_data = sample_batch_data.copy()
    
    # مقدار دمای ردیف چهارم را طوری تغییر می‌دهیم که نسبت به ردیف قبلی
    # جهش بزرگی داشته باشد (حد مجاز 2.5 است، ما جهش 4.0 ایجاد می‌کنیم)
    invalid_row_index = 3
    previous_temp = invalid_data.loc[invalid_row_index - 1, 'Temperature_In']
    invalid_data.loc[invalid_row_index, 'Temperature_In'] = previous_temp + 4.0

    # 2. Act
    processed_df = dvr_processor.apply_rule_based_checks(invalid_data)
    
    # 3. Assert
    # انتظار داریم که فلگ کلی برای ردیف نامعتبر، False باشد
    assert not processed_df.loc[invalid_row_index, 'all_rules_pass']
    
    # انتظار داریم که فلگ نقض قانون برای آن ردیف، True باشد
    assert processed_df.loc[invalid_row_index, 'rule_violation_flag']
    
    # به طور مشخص، انتظار داریم که قانون نرخ تغییر دما، False باشد
    assert not processed_df.loc[invalid_row_index, 'rule_temp_roc']