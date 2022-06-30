import { Client } from "minio";
import { BackendAPIClient } from "backend/backendAPIClient";

export const backendAPIClientInstance = new BackendAPIClient(
    process.env.BACKEND_URL,
    { fetch }
);

export * from "backend/backendAPIClient";

if (!process.env.STORAGE_URL || !process.env.STORAGE_ACCESS_KEY || !process.env.STORAGE_SECRET_KEY) {
    throw new Error("Storage environment variables not set!");
}

export const minioClientInstance = new Client({
    endPoint: process.env.STORAGE_URL,
    useSSL: true,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY
});
