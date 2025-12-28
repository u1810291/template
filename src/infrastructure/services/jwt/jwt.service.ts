import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtService,
  IJwtServicePayload,
} from '@domain/adapters/jwt.interface';

@Injectable()
export class JwtTokenService implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async checkToken(token: string): Promise<IJwtServicePayload> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decode = await this.jwtService.verifyAsync(token);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decode;
  }

  createToken(
    payload: IJwtServicePayload,
    secret: string,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }
}
