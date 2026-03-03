import { IsString, IsOptional } from 'class-validator';

export class QueryStatisticsDto {
  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  period?: 'day' | 'week' | 'month' | 'year';
}
