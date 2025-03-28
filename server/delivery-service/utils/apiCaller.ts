import axios, { AxiosRequestConfig } from 'axios';

const apiCaller = async (
  url: string,
  method: string = 'GET',
  data: any = null,
  headers: Record<string, string> = {}
): Promise<any> => {
  try {
    const config: AxiosRequestConfig = {
      url,
      method,
      data,
      headers,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error(`Error calling ${url}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'API call failed');
  }
};

export default apiCaller; 