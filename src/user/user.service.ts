// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Find user by email
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
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

    // src/user/user.service.ts
  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }
}