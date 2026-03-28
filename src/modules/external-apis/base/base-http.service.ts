import { HttpService } from '@nestjs/axios';
import { HttpException, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';

export abstract class BaseHttpService {
  protected readonly logger: Logger;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly baseUrl: string,
    protected readonly defaultHeaders: Record<string, string> = {},
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  protected async get<T>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<T>(`${this.baseUrl}${path}`, {
          ...config,
          headers: { ...this.defaultHeaders, ...config?.headers },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  protected async post<T>(
    path: string,
    body: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await lastValueFrom(
        this.httpService.post<T>(`${this.baseUrl}${path}`, body, {
          ...config,
          headers: { ...this.defaultHeaders, ...config?.headers },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    this.logger.error(
      `Error en llamada a API externa: ${error?.message}`,
      error?.stack,
    );

    if (error?.response) {
      throw new HttpException(
        error.response.data ?? error.message,
        error.response.status,
      );
    }

    throw new HttpException('Error al comunicarse con API externa', 502);
  }
}
