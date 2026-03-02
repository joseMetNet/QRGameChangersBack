import axios from 'axios';
import qs from 'qs';

const TRUORA_API_KEY = process.env.TRUORA_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiIiwiYWRkaXRpb25hbF9kYXRhIjoie30iLCJjbGllbnRfaWQiOiJUQ0llYTA0YjMxYmY3OWJhNzUzYjE5ZmFiZDI0OTNiNjI5YyIsImV4cCI6MzMzMDcwMTIwMCwiZ3JhbnQiOiIiLCJpYXQiOjE3NTM5MDEyMDAsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX1Jib0NpRXdNZyIsImp0aSI6Ijk5NjljNTc4LWYzZDYtNDcxZS1hNjI5LWZkOTJmZDAxYzZlNyIsImtleV9uYW1lIjoiam9zZXRydW9yYSIsImtleV90eXBlIjoiYmFja2VuZCIsInVzZXJuYW1lIjoiVENJZWEwNGIzMWJmNzliYTc1M2IxOWZhYmQyNDkzYjYyOWMtam9zZXRydW9yYSJ9.Q-csYFrwrG-k9rmDhsAT7zEX7FkkZV7eyZRXUI9gons';
const TRUORA_API_URL = 'https://api.validations.truora.com/v1/validations';

export const crearValidacionTruora = async (data: any) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Truora-API-Key': TRUORA_API_KEY
  };
  const body = qs.stringify(data);
  const response = await axios.post(TRUORA_API_URL, body, { headers });
  return response.data;
};

const TRUORA_API_URL_FACE_RECOGINITION = 'https://api.validations.truora.com/v1/enrollments';

export const crearEnrollmentForfacialRecognition = async (data: any) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Truora-API-Key': TRUORA_API_KEY
  };
  const body = qs.stringify(data);
  const response = await axios.post(TRUORA_API_URL_FACE_RECOGINITION, body, { headers });
  return response.data;
};

const TRUORA_API_URL_FACE_RECOGINITION_CREATE = 'https://api.validations.truora.com/v1/validations';

export const crearValidationForfacialRecognition = async (data: any) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Truora-API-Key': TRUORA_API_KEY
  };
  const body = qs.stringify(data);
  const response = await axios.post(TRUORA_API_URL_FACE_RECOGINITION_CREATE, body, { headers });
  return response.data;
};


// ✅ GET para validación de cuentas
export const getValidationAccountsDocs = async (accountId: string) => {
  const url = `https://api.validations.truora.com/v1/accounts/${accountId}/validations`;
  const headers = { 'Truora-API-Key': TRUORA_API_KEY };
  const response = await axios.get(url, { headers });
  return response.data;
};

// ✅ GET para validación de documentos
export const getValidationDocs = async (validationId: string) => {
  const url = `https://api.validations.truora.com/v1/validations/${validationId}`;
  const headers = { 'Truora-API-Key': TRUORA_API_KEY };
  const response = await axios.get(url, { headers });
  return response.data;
};

// ✅ GET para validación de reconocimiento facial
export const getValidationForfacialRecognition = async (idValidation: string) => {
  const url = `https://api.validations.truora.com/v1/validations/${idValidation}`;
  const headers = { 'Truora-API-Key': TRUORA_API_KEY };
  const response = await axios.get(url, { headers });
  return response.data;
};

// ✅ GET para validación de inscripción de reconocimiento facial o creacion de enrollment
export const getEnrollmentForfacialRecognitionCreated = async (enrollmentId: string) => {
  const url = `https://api.validations.truora.com/v1/enrollments/${enrollmentId}`;
  const headers = { 'Truora-API-Key': TRUORA_API_KEY };
  const response = await axios.get(url, { headers });
  return response.data;
};