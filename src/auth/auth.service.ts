// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Validate user for local strategy (email/password authentication)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user && user.hash) {
      const isPasswordValid = await argon2.verify(user.hash, password);
      if (isPasswordValid) {
        const { hash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register user and hash password
  async register(email: string, password: string) {
    const hashedPassword = await argon2.hash(password);

    const defaultRole = await this.userService.findRoleByName('user'); // assuming the default role is 'user'
    if (!defaultRole) {
      throw new Error('Default role not found');
    }

    return this.userService.createUser({
      email,
      hash: hashedPassword,
      roleId: defaultRole.id,
    });
  }
}