import { Controller, Get } from '@nestjs/common';
import { Public } from './public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  health(): boolean {
    return true;
  }
}
