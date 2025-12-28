import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';

import { Symbols } from '@domain/symbols';

import { LoginUseCases } from '@usecases/auth/login.usecases';

import { LoggerService } from '@infrastructure/logger/logger.service';
import { UseCaseProxy } from '@infrastructure/usecases-proxy/usecases-proxy';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Symbols.LOGIN_USECASES_PROXY)
    private readonly loginUseCaseProxy: UseCaseProxy<LoginUseCases>,
    private readonly logger: LoggerService,
    private readonly exceptionService: ExceptionsService,
  ) {
    super();
  }

  async validate(email: string, password: string) {
    if (!email || !password) {
      this.logger.warn(
        'LocalStrategy',
        `Email or password is missing, BadRequestException`,
      );
      this.exceptionService.UnauthorizedException();
    }
    const user = await this.loginUseCaseProxy
      .getInstance()
      .validateUserForLocalStrategy(email, password);
    if (!user) {
      this.logger.warn('LocalStrategy', `Invalid email or password`);
      this.exceptionService.UnauthorizedException({
        message: 'Invalid email or password.',
      });
    }
    return user;
  }
}
