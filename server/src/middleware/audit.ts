import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { query } from '../db';

export const auditLog = (action: string, entityType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      if (res.statusCode < 400 && req.user) {
        query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user.id,
            action,
            entityType || null,
            data?.data?.id || req.params.id || null,
            data?.data ? JSON.stringify(data.data) : null,
            req.ip,
            req.get('User-Agent') || null
          ]
        ).catch(console.error);
      }
      return originalJson(data);
    };
    next();
  };
};
