import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: 'server',
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },

  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  // ✅ Plugins
  plugins: [
    {
      resolve: '@rsc-labs/medusa-products-bought-together-v2',
      options: {},
    },
    {
      resolve: '@rsc-labs/medusa-wishlist',
      options: {},
    },
    {
      resolve: '@lambdacurry/medusa-product-reviews',
      options: {
        defaultReviewStatus: 'pending', // optional
      },
    },
    {
      resolve: '@rsc-labs/medusa-store-analytics-v2',
      options: {},
    },
    {
      resolve: 'medusa-plugin-razorpay-v2',
      options: {},
    },
  ],

  // ✅ Modules
  modules: [
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: {
        redisUrl: process.env.CACHE_REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: {
        redis: {
          url: process.env.WE_REDIS_URL,
        },
      },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: {
        redisUrl: process.env.EVENTS_REDIS_URL,
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-s3',
            id: 's3',
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-sendgrid',
            id: 'sendgrid',
            options: {
              channels: ['email'],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
          {
            resolve: 'medusa-plugin-razorpay-v2/providers/payment-razorpay/src',
            id: 'razorpay',
            options: {
              key_id: process?.env?.RAZORPAY_TEST_KEY_ID ?? process?.env?.RAZORPAY_ID,
              key_secret: process?.env?.RAZORPAY_TEST_KEY_SECRET ?? process?.env?.RAZORPAY_SECRET,
              razorpay_account: process?.env?.RAZORPAY_TEST_ACCOUNT ?? process?.env?.RAZORPAY_ACCOUNT,
              automatic_expiry_period: 30,
              manual_expiry_period: 20,
              refund_speed: 'normal',
              webhook_secret: process?.env?.RAZORPAY_TEST_WEBHOOK_SECRET ?? process?.env?.RAZORPAY_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/index',
      options: {},
    },
    {
      resolve: '@medusajs/medusa/analytics',
      options: {
        providers: [
          {
            resolve: '@medusajs/analytics-posthog',
            id: 'posthog',
            options: {
              posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
              posthogHost: process.env.POSTHOG_HOST,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/auth',
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
            options: {},
          },
        ],
      },
    },
  ],
})
