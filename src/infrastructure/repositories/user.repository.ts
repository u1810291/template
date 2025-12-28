import { Users } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@config/prisma/prisma.service';
import { UserRepositoryI } from '@domain/repositories/user-repository.interface';

import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service';
import { PrismaRepository } from '@infrastructure/repositories/prisma.repository';

@Injectable()
export class DatabaseUserRepository
  extends PrismaRepository<'users'>
  implements UserRepositoryI
{
  constructor(
    protected readonly prisma: PrismaService,
    private readonly encrypt: BcryptService,
  ) {
    super(prisma, 'users');
  }

  updateLastLogin(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async updateRefreshToken(email: string, refreshToken: string): Promise<void> {
    await this.update({
      where: {
        email: email,
      },
      data: {
        hashRefreshToken: refreshToken,
      },
    });
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    const adminUserEntity = (await this.findFirst({
      where: {
        email: email,
      },
    })) as Users | null;
    if (!adminUserEntity) {
      return null;
    }
    return adminUserEntity;
  }

  async register(
    user: Pick<Users, 'email' | 'name' | 'password'>,
  ): Promise<Users> {
    const password = await this.encrypt.hash(user.password);

    const userRegister = (await this.create({
      data: {
        name: user.name,
        email: user.email,
        password: password,
      },
    })) as Users;
    return userRegister;
  }
}
