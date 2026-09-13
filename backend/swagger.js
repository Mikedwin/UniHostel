const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UniHostel API',
      version: '1.0.1',
      description: 'Student accommodation marketplace API with secure authentication, payment processing, and booking management',
      contact: {
        name: 'UniHostel Support',
        email: process.env.ADMIN_EMAIL
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://unihostel-production.up.railway.app'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student', 'manager', 'admin'] }
          }
        },
        Hostel: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            roomTypes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['1 in a Room', '2 in a Room', '3 in a Room', '4 in a Room'] },
                  price: { type: 'number' },
                  totalCapacity: { type: 'number' },
                  occupiedCapacity: { type: 'number' },
                  available: { type: 'boolean' }
                }
              }
            },
            facilities: { type: 'array', items: { type: 'string' } },
            isAvailable: { type: 'boolean' }
          }
        },
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            hostelId: { type: 'string' },
            studentId: { type: 'string' },
            roomType: { type: 'string' },
            semester: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved_for_payment', 'paid_awaiting_final', 'approved', 'rejected'] },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'] },
            hostelFee: { type: 'number' },
            adminCommission: { type: 'number' },
            totalAmount: { type: 'number' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and account management' },
      { name: 'Hostels', description: 'Hostel listing and management' },
      { name: 'Applications', description: 'Student applications and bookings' },
      { name: 'Payments', description: 'Payment processing via Paystack' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'GDPR', description: 'Data privacy and compliance' }
    ]
  },
  apis: ['./server.js', './routes/*.js']
};

module.exports = swaggerJsdoc(options);
