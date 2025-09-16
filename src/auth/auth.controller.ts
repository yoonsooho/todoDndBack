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
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';
import { Request } from 'express';

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

    res.cookie('access_token', tokens.accessToken, accessCookieOptions);
    res.cookie('refresh_token', tokens.refreshToken, refreshCookieOptions);

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

  @Get('refresh')
  async refreshAllTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // RefreshTokenGuard를 사용하여 토큰 검증
      return await this.refreshTokens(req, res);
    } catch (error) {
      console.log('🚨 Refresh token error caught:', error.message);
      // 토큰이 유효하지 않으면 쿠키 삭제
      this.clearCookies(res);
      console.log('🍪 Cookies cleared due to error');
      throw error;
    }
  }

  @UseGuards(RefreshTokenGuard)
  private async refreshTokens(req: Request, res: Response) {
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

  private clearCookies(res: Response) {
    console.log('🧹 Starting to clear cookies...');
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    console.log('🍪 Clear cookie options:', clearCookieOptions);

    res.cookie('access_token', '', {
      ...clearCookieOptions,
      maxAge: 0,
    });
    res.cookie('refresh_token', '', {
      ...clearCookieOptions,
      httpOnly: true,
      maxAge: 0,
    });

    console.log('✅ Cookies clear commands sent');
  }
}
