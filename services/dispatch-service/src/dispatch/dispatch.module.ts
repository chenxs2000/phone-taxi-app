import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { Driver, DriverSchema } from './entities/driver.entity';
import { Dispatch, DispatchSchema } from './entities/dispatch.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: Dispatch.name, schema: DispatchSchema },
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
