import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('changelog')
export class ChangelogProcessor extends WorkerHost {
  private readonly logger = new Logger(ChangelogProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('process');
    // do some stuff
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    this.logger.log('completed');
    // do some stuff
  }
}
