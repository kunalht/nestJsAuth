// src/types/custom.d.ts

import 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      // Add other properties that are relevant
    }

    interface Request {
      user?: User;  // Now TypeScript knows about `req.user`
    }
  }
}