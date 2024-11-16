// src/context/index.ts
import { PrismaClient, User } from "@prisma/client";
import { Request } from 'express';
import jwt from 'jsonwebtoken';

export interface Context {
    prisma: PrismaClient;
    user?: User | null;
}

const prisma = new PrismaClient();

export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
    let user = null;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });
        } catch (error) {
            console.error('Auth error:', error);
        }
    }

    return {
        prisma,
        user
    };
};