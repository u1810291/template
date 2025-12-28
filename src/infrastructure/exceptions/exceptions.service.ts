import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IException,
  IFormatExceptionMessage,
} from '@domain/exceptions/exceptions.interface';

@Injectable()
export class ExceptionsService implements IException {
  BadRequestException(data: IFormatExceptionMessage): void {
    throw new BadRequestException(data);
  }
  InternalServerErrorException(data?: IFormatExceptionMessage): void {
    throw new InternalServerErrorException(data);
  }
  ForbiddenException(data?: IFormatExceptionMessage): void {
    throw new ForbiddenException(data);
  }
  UnauthorizedException(data?: IFormatExceptionMessage): void {
    throw new UnauthorizedException(data);
  }
  NotFoundException(data?: IFormatExceptionMessage): void {
    throw new NotFoundException(data);
  }
  ConflictException(data?: IFormatExceptionMessage): void {
    throw new ConflictException(data);
  }
}
