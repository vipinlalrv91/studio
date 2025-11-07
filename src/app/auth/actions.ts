
'use server';

import axios from 'axios';

// Hardcode the backend URL for absolute certainty
const API_URL = 'http://localhost:3001/api';

export async function login({ email, password }) {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw new Error('Failed to login.');
  }
}

export async function register({ name, email, password }) {
  try {
    // Log the URL to the server console for debugging
    console.log(`Attempting to register at: ${API_URL}/register`); 

    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log the detailed Axios error to the server console
      console.error('Axios error registering:', error.toJSON());
    } else {
      console.error('Generic error registering:', error);
    }
    throw new Error('Failed to register.');
  }
}
