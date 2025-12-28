import { Users } from '@prisma/client';
import { PrismaRepositoryI } from './prisma-repository.interface';

export interface UserRepositoryI extends PrismaRepositoryI<'users'> {
  getUserByEmail(email: string): Promise<Users | null>;
  updateLastLogin(email: string): Promise<void>;
  updateRefreshToken(email: string, refreshToken: string): Promise<void>;
  register(user: Pick<Users, 'email' | 'password' | 'name'>): Promise<Users>;
}
