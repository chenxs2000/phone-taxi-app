import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// 临时解决方案：在本地定义工具函数
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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'phone-taxi-app-secret-key',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Token无效'));
    }
    return { userId: payload.userId };
  }
}
