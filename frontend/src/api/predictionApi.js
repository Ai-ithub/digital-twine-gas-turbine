// src/api/predictionApi.js

import apiClient from './apiClient';

export const getLatestRul = () => {
  return apiClient.get('/predict/rul');
};