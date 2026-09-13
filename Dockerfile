# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
# Copy the built frontend from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./client/build

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app/backend
COPY --from=backend-builder /app/backend .
# Set environment variables
ENV NODE_ENV=production
# Expose the port the app runs on
EXPOSE 5000
# Start the application
CMD ["node", "server.js"]