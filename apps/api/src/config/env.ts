/**
 * Environment configuration for ProjuktiX API.
 * STRICT POLICY:
 * - Direct read from process.env only.
 * - NO dotenv package.
 * - NO .env files.
 * - NO hardcoded secrets or project credentials in code.
 * - All secrets injected via GitHub Actions / Render Environment settings.
 */

export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsAllowedOrigins: string[];
  appOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  firebase: {
    projectId: string;
    clientEmail?: string;
    privateKey?: string;
    serviceAccountJson?: string;
    webApiKey: string;
    authDomain: string;
    appId: string;
    messagingSenderId?: string;
  };
}

function getOrigins(): string[] {
  const allowed = process.env.CORS_ALLOWED_ORIGINS;
  if (!allowed) {
    return [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'https://projuktix.onrender.com',
    ];
  }
  return allowed
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export const env: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  corsAllowedOrigins: getOrigins(),
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins default
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300', 10),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    webApiKey: process.env.FIREBASE_WEB_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    appId: process.env.FIREBASE_APP_ID || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  },
};
