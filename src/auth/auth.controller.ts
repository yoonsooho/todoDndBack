import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Request } from 'express';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  async login(
    @Body() data: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(data);
    const isProduction = process.env.NODE_ENV === 'production';

    // 테스트: 매우 긴 만료시간으로 설정
    const now = Date.now();
    const accessExpires = new Date(now + 1000 * 60 * 60 * 24 * 30); // 30일 후
    const refreshExpires = new Date(now + 1000 * 60 * 60 * 24 * 365); // 1년 후

    console.log('Setting cookies (LONG expiry for testing):', {
      isProduction,
      nowUTC: new Date(now).toISOString(),
      accessExpiresUTC: accessExpires.toISOString(),
      refreshExpiresUTC: refreshExpires.toISOString(),
    });

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const cookieOptions = {
      maxAge: 1000 * 60 * 60, // 1시간
      secure: isProduction, // HTTPS에서만
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // Cross-origin 허용
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true, // XSS 방지
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, cookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    console.log('Cookie options applied:', {
      cookieOptions,
      refreshCookieOptions,
    });

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken, // Safari/Chrome 쿠키 차단 대비
      message: '로그인 성공',
      cookieSupport: true, // 쿠키도 시도함을 알림
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    this.authService.signOut(userId);
    const isProduction = process.env.NODE_ENV === 'production';

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', '', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    return {
      message: '로그아웃 성공',
    };
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshAllTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    const tokens = await this.authService.refreshAllTokens(
      userId,
      refreshToken,
    );
    const isProduction = process.env.NODE_ENV === 'production';

    // 로그인과 동일한 쿠키 설정 적용
    const cookieOptions = {
      maxAge: 1000 * 60 * 15, // 15분
      secure: isProduction, // HTTPS에서만
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // Cross-origin 허용
      path: '/',
    };

    const refreshCookieOptions = {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      httpOnly: true, // XSS 방지
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, cookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    console.log('Refresh: Cookie options applied:', {
      cookieOptions,
      refreshCookieOptions,
    });

    return {
      access_token: tokens.accessToken,
      message: '로그인 성공',
    };
  }
}
