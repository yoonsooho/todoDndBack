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

    // UTC 기준으로 명시적 설정
    const now = new Date();
    const accessExpires = new Date(now.getTime() + 1000 * 60 * 60); // 1시간
    const refreshExpires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7일

    console.log('Setting cookies:', {
      isProduction,
      serverTime: now.toISOString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accessExpires: accessExpires.toISOString(),
      refreshExpires: refreshExpires.toISOString(),
    });

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: false, // 클라이언트에서 확인 가능하도록
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 시간대 문제 방지를 위해 maxAge만 사용
      path: '/',
      domain: isProduction ? undefined : 'localhost', // 도메인 명시적 설정
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 시간대 문제 방지를 위해 maxAge만 사용
      path: '/',
      domain: isProduction ? undefined : 'localhost', // 도메인 명시적 설정
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
    const accessExpires = new Date(Date.now() + 1000 * 60 * 60); // 1시간
    const refreshExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7일

    // // 쿠키 설정은 컨트롤러에서!
    res.cookie('access_token', tokens.accessToken, {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60,
      expires: accessExpires,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      expires: refreshExpires,
      path: '/',
    });

    return {
      access_token: tokens.accessToken,
      message: '로그인 성공',
    };
  }
}
