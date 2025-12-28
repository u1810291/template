import { ExceptionsModule } from '@infrastructure/exceptions/exceptions.module';
import { Module } from '@nestjs/common';
import { AuthUseCasesProxyModule } from '@usecases/auth/auth-usecases-proxy.module';
import { UserUseCasesProxyModule } from '@usecases/user/user-usecase-proxy.module';

@Module({
  imports: [
    AuthUseCasesProxyModule.register(),
    UserUseCasesProxyModule.register(),
    ExceptionsModule,
  ],
})
export class UseCasesProxyModule {}
