// Cliente API general para el frontend de finiquitos
// Utiliza Axios y lee la base de la URL desde variables de entorno
import axios from 'axios';
import qs from 'qs';

const apiClient = axios.create({
  baseURL: import.meta.env.APP_API_BASE_URL,
  timeout: 100000,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
});

// Interceptor de respuesta para manejo global de errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Si la respuesta tiene un campo 'detail', lo propagamos como mensaje amigable
    if (error.response && error.response.data && error.response.data.detail) {
      return Promise.reject(new Error(error.response.data.detail));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
