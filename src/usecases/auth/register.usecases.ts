import { UserRepositoryI } from '@domain/repositories/user-repository.interface';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';
import { Users } from '@prisma/client';

export class RegisterUseCases {
  constructor(
    private readonly userRepository: UserRepositoryI,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    user: Pick<Users, 'email' | 'name' | 'password'>,
  ): Promise<Users> {
    const userExists = await this.userRepository.getUserByEmail(user.email);

    if (userExists?.id) {
      this.exceptionService.BadRequestException({
        code_error: 400,
        message: 'User with this email is already exists',
      });
    }

    return this.userRepository.register(user);
  }
}
