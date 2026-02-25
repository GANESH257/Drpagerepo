import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_WWW,
    'https://staging.aipstl.org',
    'https://www.staging.aipstl.org',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
