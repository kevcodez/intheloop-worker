import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase.module';
import { TopicWriter } from './topic-writer';

@Module({
  imports: [SupabaseModule],
  providers: [TopicWriter],
  exports: [TopicWriter],
})
export class TopicModule {}
