import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SuscripcionesService } from '../suscripciones.service';

@Injectable()
export class ConsultaLimitGuard implements CanActivate {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clienteId = request.user?.sub;
    await this.suscripcionesService.verificarYRegistrarConsulta(clienteId);
    return true;
  }
}
