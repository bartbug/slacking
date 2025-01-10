import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Add JWT expiration if not in env
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Assert JWT_SECRET type after validation
const JWT_SECRET: string = process.env.JWT_SECRET || '';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors into a readable message
      const errorMessages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ error: errorMessages });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors into a readable message
      const errorMessages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ error: errorMessages });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate token route
router.get('/validate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 