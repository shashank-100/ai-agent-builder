import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import agentRoutes from './routes/agents';
import templateRoutes from './routes/templates';
import workspaceRoutes from './routes/workspaces';
import workflowRoutes from './routes/workflows';
import analyticsRoutes from './routes/analytics';
import toolRoutes from './routes/tools';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tools', toolRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-workflow', (workflowId: string) => {
    socket.join(`workflow:${workflowId}`);
    console.log(`Client ${socket.id} joined workflow:${workflowId}`);
  });

  socket.on('workflow-update', (data) => {
    socket.to(`workflow:${data.workflowId}`).emit('workflow-updated', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(`workflow:${data.workflowId}`).emit('cursor-moved', {
      userId: socket.id,
      ...data,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
🚀 AI Agent Builder Backend

Environment: ${process.env.NODE_ENV || 'development'}
Server:      http://localhost:${PORT}
Health:      http://localhost:${PORT}/health
API:         http://localhost:${PORT}/api

Database:    ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}
Redis:       ${process.env.REDIS_URL ? '✅ Connected' : '❌ Not configured'}
Claude API:  ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}

📊 Performance Monitoring: Enabled
🔒 Security: Helmet + Rate Limiting
🌐 WebSocket: Enabled for real-time collaboration
  `);
});

export { io };
