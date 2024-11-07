const { loadEnv, defineConfig } = require('@medusajs/framework/utils');
// Removed unused import: const { Modules } = require("@medusajs/framework/utils");

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://medusa:password@localhost/medusa",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7000,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { 
        redisUrl: process.env.CACHE_REDIS_URL || "redis://localhost:6379",
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: process.env.WE_REDIS_URL || "redis://localhost:6379",
        },
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { 
        redisUrl: process.env.EVENTS_REDIS_URL || "redis://localhost:6379",
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL || "https://your-s3-bucket-url.com",
              access_key_id: process.env.S3_ACCESS_KEY_ID || "your-access-key-id",
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY || "your-secret-access-key",
              region: process.env.S3_REGION || "us-east-1",
              bucket: process.env.S3_BUCKET || "your-s3-bucket-name",
              endpoint: process.env.S3_ENDPOINT || "https://s3.amazonaws.com",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY || "your-sendgrid-api-key",
              from: process.env.SENDGRID_FROM || "no-reply@yourdomain.com",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY || "your-stripe-api-key",
            },
          },
        ],
      },
    },
    {
      // Meilisearch plugin configuration
      resolve: "medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
          apiKey: process.env.MEILISEARCH_API_KEY || "your-meilisearch-api-key",
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: [
                "title", 
                "description",
                "variant_sku",
              ],
              displayedAttributes: [
                "title", 
                "description", 
                "variant_sku", 
                "thumbnail", 
                "handle",
              ],
            },
            primaryKey: "id",
            transformer: (product) => ({
              id: product.id,
              // other attributes...
            }),
          },
        },
      },
    },
  ]
});
