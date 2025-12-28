import { Users } from '@prisma/client';
import { UserRepositoryI } from '@domain/repositories/user-repository.interface';

export class IsAuthenticatedUseCases {
  constructor(private readonly adminUserRepo: UserRepositoryI) {}

  async execute(email: string): Promise<Omit<Users, 'password'> | null> {
    const user = await this.adminUserRepo.getUserByEmail(email);
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...info } = user;
    return info;
  }
}
