import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );

  const refreshToken = jwt.sign(
    { id: user.id, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as any
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Check duplicate email
    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows[0]) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userResult = await query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, active, created_at`,
      [name, email, hashed, role]
    );
    const user = userResult.rows[0];

    // If customer role, create customer record
    if (role === 'customer') {
      const custResult = await query(
        `INSERT INTO customers (user_id, name, email) VALUES ($1, $2, $3) RETURNING id`,
        [user.id, name, email]
      );
      await query(
        `INSERT INTO loyalty_accounts (customer_id, points, tier) VALUES ($1, 0, 'bronze')`,
        [custResult.rows[0].id]
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    // Update last login
    await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken }
    });
  } catch (error: any) {
    console.error('[AUTH] Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `SELECT id, name, email, password, role, active FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Clean old tokens for this user (keep last 5)
    const oldTokens = await query(
      `SELECT id FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at ASC`,
      [user.id]
    );
    if (oldTokens.rows.length >= 5) {
      const idsToDelete = oldTokens.rows.slice(0, oldTokens.rows.length - 4).map((r: any) => r.id);
      await query(`DELETE FROM refresh_tokens WHERE id = ANY($1)`, [idsToDelete]);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    // Redirect hint based on role
    const redirectMap: Record<string, string> = {
      admin: '/admin/dashboard',
      employee: '/pos',
      kitchen: '/kds',
      customer: '/customer/dashboard',
    };

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
        redirect: redirectMap[user.role] || '/'
      }
    });
  } catch (error: any) {
    console.error('[AUTH] Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Check in DB
    const tokenResult = await query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()`,
      [refreshToken, decoded.id]
    );

    if (!tokenResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const userResult = await query(
      `SELECT id, name, email, role, active FROM users WHERE id = $1`,
      [decoded.id]
    );

    const user = userResult.rows[0];
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    // Rotate tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, newRefreshToken, expiresAt]
    );

    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, active, avatar_url, last_login, created_at FROM users WHERE id = $1`,
      [req.user!.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get user data' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query(`SELECT password FROM users WHERE id = $1`, [req.user!.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, req.user!.id]);

    // Invalidate all refresh tokens
    await query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [req.user!.id]);

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};
