import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: '响应码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data: T;

  @ApiProperty({ description: '响应时间戳' })
  timestamp: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  list: T[];

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;
}
