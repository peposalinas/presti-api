import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiKeysService } from '../../clientes/api-keys.service';

@Injectable()
export class JwtOrApiKeyAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (apiKey) {
      const key = await this.apiKeysService.findActiveKey(apiKey);
      if (!key) throw new UnauthorizedException('API Key inválida o desactivada');
      // Setear request.user para que @CurrentCliente() funcione igual que con JWT
      (request as any).user = { sub: key.clienteId };
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
