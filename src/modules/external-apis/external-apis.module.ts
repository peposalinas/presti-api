import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BcraService } from './bcra/bcra.service';
import { VerazService } from './veraz/veraz.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  providers: [BcraService, VerazService],
  exports: [BcraService, VerazService],
})
export class ExternalApisModule {}
