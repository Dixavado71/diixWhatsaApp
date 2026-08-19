import './tests/setup.js';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL_PRESENT:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL_LENGTH:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
