import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from 'src/supabase.module';
import { ChangelogJobScheduler } from './ChangelogJobScheduler';
import { ChangelogProcessor } from './ChangelogProcessor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'changelog',
    }),
    SupabaseModule,
  ],

  providers: [ChangelogProcessor, ChangelogJobScheduler],
})
export class ReleaseModule {}
