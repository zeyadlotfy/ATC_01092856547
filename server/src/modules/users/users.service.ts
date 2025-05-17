import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/users.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, ...rest } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...rest,
      },
    });

    const { password: _, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    users: UserResponseDto[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          profileImageUrl: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users: users as UserResponseDto[],
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        profileImageUrl: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as UserResponseDto;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          language: updateUserDto.language,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          profileImageUrl: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser as UserResponseDto;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateAvatar(userId: string, avatar) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (avatar) {
      const buffer = await this.cloudinary.uploadFile(avatar);
      if (buffer) {
        if (user.profileImageId && user.profileImageId !== null) {
          await this.cloudinary.deleteFile(user.profileImageId);
        }
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            profileImageUrl: buffer.url,
            profileImageId: buffer.public_id,
          },
        });
      } else {
        throw new BadRequestException('Invalid image format');
      }
    } else {
      throw new BadRequestException('Invalid image format');
    }
    return {
      message: 'Avatar updated successfully',
    };
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        event: true,
      },
    });
  }

  async getAdminStats() {
    const totalUsers = await this.prisma.user.count();
    const totalEvents = await this.prisma.event.count();
    const totalVenues = await this.prisma.venue.count();
    const totalBookings = await this.prisma.booking.count();
    const totalTags = await this.prisma.tag.count();
    const totalCategories = await this.prisma.category.count();
    const activeUsers = await this.prisma.user.count({
      where: {
        isActive: true,
      },
    });

    return {
      totalUsers,
      totalEvents,
      totalBookings,
      totalVenues,
      totalTags,
      totalCategories,
      activeUsers,
    };
  }
}
