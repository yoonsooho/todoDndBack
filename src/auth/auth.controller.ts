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

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: false, // 클라이언트에서 확인 가능하도록
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30일 (테스트용)
      expires: accessExpires, // 30일 후 만료
      path: '/',
      domain: isProduction ? undefined : 'localhost',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1년 (테스트용)
      expires: refreshExpires, // 1년 후 만료
      path: '/',
      domain: isProduction ? undefined : 'localhost',
    });

    return {
      access_token: tokens.accessToken,
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

    // UTC 기준으로 정확하게 계산
    const now = Date.now(); // UTC 타임스탬프
    const accessExpires = new Date(now + 1000 * 60 * 60); // 1시간 후
    const refreshExpires = new Date(now + 1000 * 60 * 60 * 24 * 7); // 7일 후

    console.log(
      'Refresh: Setting cookies with both maxAge and expires (UTC corrected)',
    );

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 상대적 시간
      expires: accessExpires, // 절대적 시간 (UTC 기준)
      path: '/',
      domain: isProduction ? undefined : 'localhost',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 상대적 시간
      expires: refreshExpires, // 절대적 시간 (UTC 기준)
      path: '/',
      domain: isProduction ? undefined : 'localhost',
    });

    return {
      access_token: tokens.accessToken,
      message: '로그인 성공',
    };
  }
}
