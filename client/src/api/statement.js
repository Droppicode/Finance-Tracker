import axiosInstance from './axios';

export const processStatement = async (file) => {
  const formData = new FormData();
  formData.append('statement', file);

  const response = await axiosInstance.post('/api/process-statement/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log("backend response from document", response.data);

  return response.data;
};
