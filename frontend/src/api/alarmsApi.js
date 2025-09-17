// src/api/alarmsApi.js
import apiClient from './apiClient';

export const getAlarmsHistory = () => {
  return apiClient.get('/alarms/history?limit=100');
};