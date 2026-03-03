import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { DailyStatistics, DailyStatisticsSchema } from './entities/daily-statistics.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyStatistics.name, schema: DailyStatisticsSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
