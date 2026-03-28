import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExternalApisModule } from '../external-apis/external-apis.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AiModule, ExternalApisModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
