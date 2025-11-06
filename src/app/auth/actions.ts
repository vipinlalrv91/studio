
'use server';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw new Error('Failed to login.');
  }
}

export async function register(name, email, password) {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw new Error('Failed to register.');
  }
}
