import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePasswords = (password: string, hash: string) => bcrypt.compare(password, hash);
export const generateToken = (user: any) => jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);