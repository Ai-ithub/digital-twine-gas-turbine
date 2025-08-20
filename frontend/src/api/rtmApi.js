import apiClient from './apiClient';

export const getHistoricalRtmData = (params) => {
  return apiClient.get('/rtm/historical', { params });
};

export const getSystemStatus = () => {
  return apiClient.get('/status/overview');
};

export const getHistoricalData = (timeRange) => {
  // timeRange can be "-10m", "-1h", "-24h", etc.
  return apiClient.get('/data/get_live_data', {
    params: {
      start: timeRange,
    },
  });
};