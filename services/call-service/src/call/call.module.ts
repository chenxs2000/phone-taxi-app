import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { Call, CallSchema } from './entities/call.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }])],
  controllers: [CallController],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
