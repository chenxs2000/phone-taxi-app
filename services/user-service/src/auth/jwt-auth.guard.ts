import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

// 临时解决方案：在本地定义工具函数和常量
function successResponse(code: number, data: any, message?: string) {
  return {
    success: true,
    code,
    data,
    message: message || '操作成功',
  };
}

function errorResponse(code: number, message: string) {
  return {
    success: false,
    code,
    error: {
      code,
      message,
    },
  };
}

const ERROR_CODES = {
  UNAUTHORIZED: 1006,
};

const MESSAGES = {
  UNAUTHORIZED: '未授权访问',
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        errorResponse(ERROR_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED)
      );
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Token无效或已过期'));
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
