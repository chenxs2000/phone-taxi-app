import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { errorResponse, ERROR_CODES } from '../../../shared/utils';

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
