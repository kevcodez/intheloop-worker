import { BullModule } from '@nestjs/bullmq';
import { Module, Scope } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { HealthController } from './app.controller';
import { ReleaseModule } from './release/release.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        },
      }),
    }),
    ReleaseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
