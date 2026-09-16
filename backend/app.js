const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require('dotenv').config();

const logger = require('./config/logger');
const { TRUST_PROXY_HOPS, VISITOR_TRACKING_ENABLED, shouldExposeApiDocs } = require('./config/env');
const { isDbConnected } = require('./config/db');
const { corsOptions } = require('./config/cors');
const { helmetMiddleware, apiLimiter } = require('./config/security');

const intrusionDetection = require('./middleware/intrusionDetection');
const trackVisitor = require('./middleware/trackVisitor');
const apiRoutes = require('./routes/index');

const app = express();

// Trust proxy
app.set('trust proxy', TRUST_PROXY_HOPS);

// Logging
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(cookieParser());

// CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security Middleware
app.use(helmetMiddleware);
app.use('/api/', apiLimiter);
app.use(mongoSanitize());
app.use(hpp());

// Intrusion Detection System
if (process.env.SECURITY_ENABLED === 'true') {
  app.use(intrusionDetection);
  logger.info('Intrusion Detection System ENABLED');
} else {
  logger.info('Intrusion Detection System DISABLED');
}

// Visitor Tracking
if (VISITOR_TRACKING_ENABLED) {
  app.use(trackVisitor);
  logger.info('Visitor tracking enabled');
} else {
  logger.info('Visitor tracking disabled');
}

// Root Metadata Endpoint
app.get('/', (req, res) => {
  const responsePayload = {
    status: 'ok', 
    message: 'UniHostel API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.8'
  };

  if (shouldExposeApiDocs()) {
    responsePayload.documentation = '/api-docs';
  }

  res.json(responsePayload);
});

// Swagger API Documentation
app.use('/api-docs', (req, res, next) => {
  if (!shouldExposeApiDocs()) {
    return res.status(404).json({ error: 'Not found' });
  }
  return next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'UniHostel API Documentation'
}));

// Enhanced Health Check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const isHealthy = dbState === 1;
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json({ 
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: {
      status: dbStatus[dbState] || 'unknown',
      connected: isDbConnected(),
      readyState: dbState
    },
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Database check middleware for API operations
app.use('/api/hostels', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database temporarily unavailable. Please try again in a moment.',
      retryAfter: 5
    });
  }
  next();
});

// Mount All API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled Server Error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: isProd ? 'Internal Server Error' : err.message
  });
});

module.exports = app;
