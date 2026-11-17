import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase.js';
import { UserProfile, UserRole } from '@projuktix/types';
import { ForbiddenError, UnauthorizedError } from '@projuktix/shared';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export async function authenticateToken(token: string): Promise<UserProfile> {
  const decoded = await auth.verifyIdToken(token);
  const userDoc = await db.collection('users').doc(decoded.uid).get();

  if (userDoc.exists) {
    const data = userDoc.data() as UserProfile;
    if (!data.isActive) {
      throw new ForbiddenError('Account is disabled. Contact platform administrator.');
    }
    return data;
  }

  // Create new profile on first token verification
  const newProfile: UserProfile = {
    uid: decoded.uid,
    email: decoded.email || '',
    displayName: decoded.name || decoded.email?.split('@')[0] || 'Learner',
    photoUrl: decoded.picture,
    role: 'learner',
    isActive: true,
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      codeEditorTheme: 'vs-dark',
      defaultCodeFontSize: 14,
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await db.collection('users').doc(decoded.uid).set(newProfile);
  return newProfile;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split('Bearer ')[1]!.trim();
    if (!token) {
      throw new UnauthorizedError('Bearer token is empty');
    }

    req.user = await authenticateToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1]!.trim();
      if (token) {
        req.user = await authenticateToken(token);
      }
    }
    next();
  } catch {
    // Optional auth fails gracefully without throwing
    next();
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}
