import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';

import { Symbols } from '@domain/symbols';

import { JwtAuthGuard } from '@infrastructure/common/guards/jwtAuth.guard';
import { UseCaseProxy } from '@infrastructure/usecases-proxy/usecases-proxy';
import { ApiResponseType } from '@infrastructure/common/swagger/response.decorator';

import { LogoutUseCases } from '@usecases/auth/logout.usecases';
import { IsAuthenticatedUseCases } from '@usecases/auth/is-authenticated.usecases';
import { CreateTransactionUsecase } from '@usecases/transactions/create-transaction.usecases';
import { TransactionsDto } from './validators/transactions-dto.class';
import { IsAuthPresenter } from '../auth/auth.presenter';

interface RequestWithUser extends ExpressRequest {
  user?: { email: string };
  res: Response;
}

@Controller({
  version: '1',
  path: 'transactions',
})
@ApiTags('auth')
@ApiResponse({
  status: 401,
  description: 'No authorization token was found',
})
@ApiResponse({ status: 500, description: 'Internal error' })
export class AuthController {
  constructor(
    @Inject(Symbols.CREATE_TRANSACTION_USECASES_PROXY)
    private readonly createTransactionUseCaseProxy: UseCaseProxy<CreateTransactionUsecase>,
    @Inject(Symbols.LOGOUT_USECASES_PROXY)
    private readonly logoutUseCaseProxy: UseCaseProxy<LogoutUseCases>,
    @Inject(Symbols.IS_AUTHENTICATED_USECASES_PROXY)
    private readonly isAuthUseCaseProxy: UseCaseProxy<IsAuthenticatedUseCases>,
  ) {}

  @Post('create')
  @ApiBearerAuth()
  @ApiBody({ type: TransactionsDto })
  @ApiOperation({ description: 'create' })
  login() {
    // const create = await this.createTransactionUseCaseProxy.getInstance().execute(data)
    return null;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'logout' })
  logout(@Request() request: RequestWithUser) {
    const cookie = this.logoutUseCaseProxy.getInstance().execute();
    request.res.setHeader('Set-Cookie', cookie);
    return 'Logout successful';
  }

  @Get('is_authenticated')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'is_authenticated' })
  @ApiResponseType(IsAuthPresenter, false)
  async isAuthenticated(@Req() request: RequestWithUser) {
    const user = await this.isAuthUseCaseProxy
      .getInstance()
      .execute(request.user?.email ?? '');
    const response = new IsAuthPresenter();
    response.email = user?.email || '';
    return response;
  }
}
