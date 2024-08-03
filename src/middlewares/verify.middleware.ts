import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import ApiError from "../utils/apiError";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
config({ path: ".env" });

interface JwtPayload {
  id: number;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("token:\n", token)
    if (!token) {
      throw new ApiError("Unauthorized - No token provided", 401);
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new ApiError("Internal Server Error - Token secret is not defined", 500);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;

    console.log("decoded token: \n", decodedToken)
    req.user = decodedToken;

    next();

  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError("Unauthorized - Invalid token", 401));
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(error.message || "Internal Server Error", error.status || 500));
    }
  }
};

export default verifyToken;
