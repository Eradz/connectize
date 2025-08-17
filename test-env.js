// Test environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Development check:', process.env.NODE_ENV === "development");
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('NODE')));

// Test the baseURL logic from helpers/index.js
const baseURL = process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "https://about.connectize.co";
console.log('Base URL would be:', baseURL);
