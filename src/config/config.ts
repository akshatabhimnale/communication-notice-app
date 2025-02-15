export const API_URLS = {
  AUTH_SERVICE:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8000/api/v1",
  NOTICE_SERVICE:
    process.env.NEXT_PUBLIC_NOTICE_SERVICE_URL ||
    "http://localhost:8001/api/v1",
};
