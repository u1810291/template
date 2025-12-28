import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class Health {
  constructor() {}
  @Get('')
  healthCheck() {
    return 'Hello world';
  }
}
