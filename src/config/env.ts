import { Platform } from 'react-native';

export const ENV = {
  API_BASE_URL: Platform.select({
    web: 'http://localhost:8000/api/v1',
    android: 'http://10.0.2.2:8000/api/v1',
    default: 'http://localhost:8000/api/v1',
  }) as string,
  TIMEOUT_MS: 10000,
  APP_NAME: 'School Management System',
  APP_VERSION: '1.0.0',
};
