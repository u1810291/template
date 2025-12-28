import { Request } from 'express';
import { Symbols } from '@domain/symbols';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { LoginUseCases } from '@usecases/auth/login.usecases';
import { LoggerService } from '@infrastructure/logger/logger.service';
import { UseCaseProxy } from '@infrastructure/usecases-proxy/usecases-proxy';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';

interface JwtPayload {
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Symbols.LOGIN_USECASES_PROXY)
    private readonly loginUseCaseProxy: UseCaseProxy<LoginUseCases>,
    private readonly logger: LoggerService,
    private readonly exceptionService: ExceptionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication as string | null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.loginUseCaseProxy
      .getInstance()
      .validateUserForJWTStrategy(payload.email);
    if (!user) {
      this.logger.warn('JwtStrategy', `User not found`);
      this.exceptionService.UnauthorizedException({
        message: 'User not found',
      });
    }
    return user;
  }
}
