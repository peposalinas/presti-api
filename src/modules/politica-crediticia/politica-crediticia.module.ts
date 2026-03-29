import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticaCrediticiaController } from './politica-crediticia.controller';
import { PoliticaCrediticiaService } from './politica-crediticia.service';
import { PoliticaCrediticia } from './entities/politica-crediticia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticaCrediticia])],
  controllers: [PoliticaCrediticiaController],
  providers: [PoliticaCrediticiaService],
  exports: [PoliticaCrediticiaService],
})
export class PoliticaCrediticiaModule {}
