import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat IA')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Chat con el asistente de IA crediticio',
    description:
      'Envía un mensaje al asistente de IA. Si incluís un CUIL, el asistente consulta datos reales del BCRA para enriquecer su respuesta.',
  })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.chat(dto);
  }
}
