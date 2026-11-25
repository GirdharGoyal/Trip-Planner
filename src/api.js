import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/trips',
  timeout: 45000, // 45 seconds tak wait karega AI ke liye
});

export const fetchTrips = () => api.get('/');
export const createTrip = (tripData) => api.post('/', tripData);
export const updateTrip = (id, tripData) => api.put(`/${id}`, tripData);
export const deleteTrip = (id) => api.delete(`/${id}`);