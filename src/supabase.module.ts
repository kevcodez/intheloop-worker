import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

@Global()
@Module({
  providers: [
    {
      provide: 'supabaseClient',
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return createClient<Database>(configService.get('SUPABASE_URL'), configService.get('SUPABASE_KEY'));
      },
    },
  ],
  exports: ['supabaseClient'],
})
export class SupabaseModule {}
