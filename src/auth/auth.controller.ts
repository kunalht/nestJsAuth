// src/auth/auth.controller.ts
import { Controller, Post, Body, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Registration route
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  // Login route (email/password)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.login(req.user);
    res.cookie('refreshToken', tokens.refresh_token, {
        httpOnly: true,
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.json({ access_token: tokens.access_token });
}

  // Protected route example
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token']; // Assume the refresh token is stored in a cookie
    const user = req.user;
        
    const tokens = await this.authService.refreshToken(user.id, refreshToken);
    return res.json({ access_token: tokens.access_token });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout(req.user.id);
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    return res.status(HttpStatus.OK).json({ message: 'Logged out' });
  }
}