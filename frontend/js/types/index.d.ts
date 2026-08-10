export {};

declare global {
  interface Window {
    SENTRY_DSN?: string;
    COMMIT_SHA?: string;

    Urls: unknown;
  }

  namespace NodeJS {
    interface ProcessEnv {
      ARTEMIS_API_BASE_URL?: string;
    }
  }
}
