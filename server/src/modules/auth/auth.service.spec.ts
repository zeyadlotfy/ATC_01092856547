import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedpassword',
    isActive: true,
    role: 'USER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-access-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(authService['prisma'].user, 'create')
        .mockResolvedValue(mockUser as User);
      jest.spyOn(emailService, 'sendMail').mockResolvedValue(undefined);

      jest.spyOn(crypto, 'randomInt').mockReturnValue(123456 as any);

      const registerDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        message:
          'Registration successful. Please check your email for OTP verification.',
      });
      expect(emailService.sendMail).toHaveBeenCalled();
    });

    it('should throw ConflictException for existing active user', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUser as User);

      const registerDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(null);

      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset OTP', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUser as User);
      jest
        .spyOn(authService['prisma'].user, 'update')
        .mockResolvedValue(mockUser as User);
      jest.spyOn(emailService, 'sendMail').mockResolvedValue(undefined);

      jest.spyOn(crypto, 'randomInt').mockReturnValue(123456 as any);

      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      const result = await authService.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message: 'Password reset OTP has been sent to your email',
      });
      expect(emailService.sendMail).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(null);

      const forgotPasswordDto = {
        email: 'nonexistent@example.com',
      };

      await expect(
        authService.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and activate user', async () => {
      const mockUserWithOTP = {
        ...mockUser,
        OTP: '123456',
        OTPExpiry: new Date(Date.now() + 30 * 60 * 1000),
        isActive: false,
      };

      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUserWithOTP as User);
      jest.spyOn(authService['prisma'].user, 'update').mockResolvedValue({
        ...mockUserWithOTP,
        isActive: true,
        OTP: null,
        OTPExpiry: null,
      } as User);

      const verifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      const result = await authService.verifyOtp(verifyOtpDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.isActive).toBe(true);
    });

    it('should throw BadRequestException for expired OTP', async () => {
      const mockUserWithExpiredOTP = {
        ...mockUser,
        OTP: '123456',
        OTPExpiry: new Date(Date.now() - 30 * 60 * 1000),
      };

      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUserWithExpiredOTP as User);

      const verifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      await expect(authService.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUserWithOTP = {
        ...mockUser,
        OTP: '123456',
        OTPExpiry: new Date(Date.now() + 30 * 60 * 1000),
      };

      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUserWithOTP as User);
      jest
        .spyOn(authService['prisma'].user, 'update')
        .mockResolvedValue(mockUser as User);

      const resetPasswordDto = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'newpassword123',
      };

      const result = await authService.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      const mockUserWithOTP = {
        ...mockUser,
        OTP: '123456',
        OTPExpiry: new Date(Date.now() + 30 * 60 * 1000),
      };

      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUserWithOTP as User);

      const resetPasswordDto = {
        email: 'test@example.com',
        otp: 'wrongotp',
        newPassword: 'newpassword123',
      };

      await expect(authService.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const mockRefreshToken = {
        id: 'token-123',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: mockUser,
      };

      jest
        .spyOn(authService['prisma'].refreshToken, 'findUnique')
        .mockResolvedValue(mockRefreshToken as any);
      jest
        .spyOn(authService['prisma'].refreshToken, 'delete')
        .mockResolvedValue(mockRefreshToken as any);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const mockExpiredRefreshToken = {
        id: 'token-123',
        token: 'expired-refresh-token',
        expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        user: mockUser,
      };

      jest
        .spyOn(authService['prisma'].refreshToken, 'findUnique')
        .mockResolvedValue(mockExpiredRefreshToken as any);

      await expect(
        authService.refreshToken('expired-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(mockUser as User);

      const result = await authService.getProfile('user-123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        isActive: true,
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest
        .spyOn(authService['prisma'].user, 'findUnique')
        .mockResolvedValue(null);

      await expect(authService.getProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
