/**
 * Central API base URL config.
 * In development: uses localhost:5000
 * In production (Render): uses VITE_API_URL env variable
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default BASE_URL;
