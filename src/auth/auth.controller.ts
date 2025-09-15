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

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const accessCookieOptions = {
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

    console.log('🍪 Login Cookie Setting:', {
      isProduction,
      accessCookieOptions,
      refreshCookieOptions,
    });

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    console.log('✅ Login cookies set');

    return {
      message: '로그인 성공',
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = req.user['sub'];
    this.authService.signOut(userId);
    const isProduction = process.env.NODE_ENV === 'production';

    console.log('🚀 Logout Debug Info:', {
      isProduction,
      NODE_ENV: process.env.NODE_ENV,
      cookies: req.cookies,
      headers: {
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent'],
      },
    });

    // 쿠키 삭제 시 생성할 때와 동일한 옵션 사용 (httpOnly 제외하고)
    const clearCookieOptions = {
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    console.log('🍪 Clear Cookie Options:', clearCookieOptions);

    // 쿠키 삭제 (명시적 방법 사용)
    res.cookie('access_token', '', {
      ...clearCookieOptions,
      expires: new Date(0), // 1970년 1월 1일 (과거)
      maxAge: 0,
    });

    res.cookie('refresh_token', '', {
      ...clearCookieOptions,
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
    });

    console.log('✅ Cookies cleared');

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

    // Cross-origin 배포 환경을 위한 쿠키 설정
    const accessCookieOptions = {
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

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

    return {
      message: '토큰 갱신 성공',
    };
  }
}
