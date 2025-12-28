export default () => ({
  app: {
    host: process.env.APP_HOST || '0.0.0.0',
    port: parseInt(process.env.APP_PORT || '', 10) || 3000,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    debug: process.env.SENTRY_DEBUG === 'true',
    environment: process.env.SENTRY_ENV || 'development',
    release: process.env.SENTRY_RELEASE || null,
  } as SentryConfig,
});

export const ValidatorConfig = {
  transform: true,
  stopAtFirstError: true,
  whitelist: true,
};

export interface SentryConfig {
  dsn: string;
  debug: boolean;
  environment: string;
  release: string;
}
