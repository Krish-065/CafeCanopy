import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

export const initSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`[Socket] Connected: ${user.name} (${user.role}) — ${socket.id}`);

    // Join role-based rooms
    socket.join(`role:${user.role}`);
    socket.join(`user:${user.id}`);

    // POS joins session room when session is open
    socket.on('join:session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
    });

    // Kitchen joins kitchen room
    if (user.role === 'kitchen' || user.role === 'admin') {
      socket.join('kitchen');
    }

    // POS terminal events
    socket.on('pos:order_updated', (data) => {
      socket.to('kitchen').emit('kitchen:order_updated', data);
    });

    // Dashboard refresh
    socket.on('request:dashboard_stats', () => {
      io.emit('dashboard:stats_updated');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user.name}`);
    });
  });

  return io;
};
