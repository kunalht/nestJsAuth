// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  // Validate user for local strategy (email/password authentication)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }
    const passwordValid = await argon2.verify(user.hash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Incorrect password.');
    }
    const { hash, ...result } = user;
    return result;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m', // Short-lived access token
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET, // Separate secret for refresh tokens
      expiresIn: '7d', // Long-lived refresh token
    });

    // Hash the refresh token before storing it in the database
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // Store the hashed refresh token in the database
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken, // Sent to the client (or store it in an HTTP-only cookie)
    };
  }

  async refreshToken(userId: number, oldToken: string) {
    const user = await this.userService.findUserById(userId);
    if (!user || !user.refreshToken || oldToken !== user.refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const payload = { email: user.email, sub: user.id };
    const newToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: '15m'
    });

    return {
      access_token: newToken
    };
  }

  // src/auth/auth.service.ts

  async register(email: string, password: string) {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }
    const hashedPassword = await argon2.hash(password);
    const defaultRole = await this.userService.findRoleByName('user');
    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    const newUser = this.userService.createUser({
      email,
      hash: hashedPassword,
      roleId: defaultRole.id,
    });

    return this.login(newUser);
  }

  async logout(userId: number) {
    await this.userService.removeRefreshToken(userId);
  }
}