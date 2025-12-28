import { DynamicModule, Module } from '@nestjs/common';
import { UserRepositoryI } from '@domain/repositories/user-repository.interface';
import { Symbols } from '@domain/symbols';

import { EnvironmentConfigModule } from '@config/environment-config/environment-config.module';
import { EnvironmentConfigService } from '@config/environment-config/environment-config.service';

import { JwtModule } from '@infrastructure/services/jwt/jwt.module';
import { LoggerModule } from '@infrastructure/logger/logger.module';
import { LoggerService } from '@infrastructure/logger/logger.service';
import { JwtTokenService } from '@infrastructure/services/jwt/jwt.service';
import { BcryptModule } from '@infrastructure/services/bcrypt/bcrypt.module';
import { UseCaseProxy } from '@infrastructure/usecases-proxy/usecases-proxy';
import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service';
import { RepositoriesModule } from '@infrastructure/repositories/repositories.module';
import { DatabaseUserRepository } from '@infrastructure/repositories/user.repository';

import { LoginUseCases } from '@usecases/auth/login.usecases';
import { LogoutUseCases } from '@usecases/auth/logout.usecases';
import { RegisterUseCases } from '@usecases/auth/register.usecases';
import { IsAuthenticatedUseCases } from '@usecases/auth/is-authenticated.usecases';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';

@Module({
  imports: [
    LoggerModule,
    JwtModule,
    BcryptModule,
    EnvironmentConfigModule,
    RepositoriesModule,
  ],
})
export class AuthUseCasesProxyModule {
  static register(): DynamicModule {
    return {
      module: AuthUseCasesProxyModule,
      providers: [
        {
          inject: [
            LoggerService,
            JwtTokenService,
            EnvironmentConfigService,
            DatabaseUserRepository,
            BcryptService,
          ],
          provide: Symbols.LOGIN_USECASES_PROXY,
          useFactory: (
            logger: LoggerService,
            jwt: JwtTokenService,
            config: EnvironmentConfigService,
            userRepo: UserRepositoryI,
            bcrypt: BcryptService,
          ) =>
            new UseCaseProxy(
              new LoginUseCases(logger, jwt, config, userRepo, bcrypt),
            ),
        },
        {
          inject: [],
          provide: Symbols.LOGOUT_USECASES_PROXY,
          useFactory: () => new UseCaseProxy(new LogoutUseCases()),
        },
        {
          inject: [DatabaseUserRepository],
          provide: Symbols.REGISTER_USECASES_PROXY,
          useFactory: (
            userRepo: UserRepositoryI,
            exceptionService: ExceptionsService,
          ) =>
            new UseCaseProxy(new RegisterUseCases(userRepo, exceptionService)),
        },
        {
          inject: [DatabaseUserRepository],
          provide: Symbols.IS_AUTHENTICATED_USECASES_PROXY,
          useFactory: (userRepo: UserRepositoryI) =>
            new UseCaseProxy(new IsAuthenticatedUseCases(userRepo)),
        },
      ],
      exports: [
        Symbols.LOGIN_USECASES_PROXY,
        Symbols.LOGOUT_USECASES_PROXY,
        Symbols.REGISTER_USECASES_PROXY,
        Symbols.IS_AUTHENTICATED_USECASES_PROXY,
      ],
    };
  }
}
