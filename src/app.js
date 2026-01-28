const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const { createSessionMiddleware } = require('./config/session');
const { configurePassport } = require('./config/passport');
const routes = require('./routes');
const { errorConverter, errorHandler, notFound } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

/**
 * Initialize Express application
 */
const createApp = () => {
  const app = express();

  // Trust proxy (required for secure cookies behind a proxy like Heroku/Render)
  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: env.isProduction 
      ? env.frontendUrl 
      : ['http://localhost:5173', 'http://localhost:3000', env.frontendUrl],
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Request logging
  if (env.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting
  if (env.isProduction) {
    app.use('/api', apiLimiter);
  }

  // Session middleware
  app.use(createSessionMiddleware());

  // Passport initialization
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // SWAGGER DOCUMENTATION
  const swaggerOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    customSiteTitle: 'Team Task Manager API Docs',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  };

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
  );

  // Serve OpenAPI spec as JSON
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  // API routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Team Task Manager API',
      version: '1.0.0',
      documentation: '/api/docs',
    });
  });

  // Handle 404
  app.use(notFound);

  // Error handling
  app.use(errorConverter);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;