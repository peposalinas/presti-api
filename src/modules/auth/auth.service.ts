import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientesService } from '../clientes/clientes.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ access_token: string }> {
    const exists = await this.clientesService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const cliente = await this.clientesService.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
    });

    return this.generateToken(cliente.id, cliente.email);
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const cliente = await this.clientesService.findByEmail(dto.email);
    if (!cliente) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatch = await bcrypt.compare(dto.password, cliente.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciales inválidas');

    return this.generateToken(cliente.id, cliente.email);
  }

  private generateToken(clienteId: string, email: string): { access_token: string } {
    const payload = { sub: clienteId, email };
    return { access_token: this.jwtService.sign(payload) };
  }
}
