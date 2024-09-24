// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Find user by email
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  async createUser(data: { email: string; hash: string; roleId: number }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        hash: data.hash,
        role: {
          connect: { id: data.roleId }, // Correctly connect the role using roleId
        },
      },
    });
  }

  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Remove the refresh token (useful during logout or token revocation)
  async removeRefreshToken(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // Validate the refresh token (you might need this method depending on your logout or token refresh logic)
  async validateRefreshToken(userId: number, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    // Here you would compare the stored token with the provided token
    // This is just an example; you need to add your own logic based on how you store/handle tokens
    return user?.refreshToken === token;
  }

}