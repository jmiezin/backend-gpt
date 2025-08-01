// src/types/express/index.d.ts

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & {
        oid?: string;
        preferred_username?: string;
        [key: string]: any;
      };
    }
  }
}