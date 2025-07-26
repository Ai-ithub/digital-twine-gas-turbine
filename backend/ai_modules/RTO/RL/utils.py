#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import pandas as pd
from sklearn.model_selection import train_test_split

def load_compressor_data(path):
    df = pd.read_csv(path)
    return df

def split_data(df, train_ratio=0.7, val_ratio=0.15):
    train_df, test_df = train_test_split(df, test_size=1 - train_ratio)
    val_df, test_df = train_test_split(test_df, test_size=val_ratio / (1 - train_ratio))
    return train_df.values, val_df.values, test_df.values
