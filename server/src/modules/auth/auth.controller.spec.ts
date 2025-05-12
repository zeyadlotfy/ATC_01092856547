import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
} from './dto';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: Partial<AuthService>;
  let jwtServiceMock: Partial<JwtService>;
  let configServiceMock: Partial<ConfigService>;
  let reflectorMock: Partial<Reflector>;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      verifyOtp: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      refreshToken: jest.fn(),
      getProfile: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    configServiceMock = {
      get: jest.fn(),
    };

    reflectorMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockRegistrationResponse = {
        message: 'User registered successfully',
        otpSent: true,
      };

      jest
        .spyOn(authServiceMock, 'register')
        .mockResolvedValue(mockRegistrationResponse);

      const result = await authController.register(registerDto);

      expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegistrationResponse);
    });

    it('should handle registration error', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest
        .spyOn(authServiceMock, 'register')
        .mockRejectedValue(new Error('Registration failed'));

      await expect(authController.register(registerDto)).rejects.toThrow(
        'Registration failed',
      );
    });
  });

  describe('verifyOtp', () => {
    it('should successfully verify OTP', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      const mockVerifyResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: Role.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profileImageUrl: 'https://example.com/profile.jpg',
          profileImageId: 'profile-image-id',
          language: 'en',
        },
      };

      jest
        .spyOn(authServiceMock, 'verifyOtp')
        .mockResolvedValue(mockVerifyResponse);

      const result = await authController.verifyOtp(verifyOtpDto);

      expect(authServiceMock.verifyOtp).toHaveBeenCalledWith(verifyOtpDto);
      expect(result).toEqual(mockVerifyResponse);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockLoginResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: Role.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profileImageUrl: 'https://example.com/profile.jpg',
          profileImageId: 'profile-image-id',
          language: 'en',
        },
      };

      jest.spyOn(authServiceMock, 'login').mockResolvedValue(mockLoginResponse);

      const result = await authController.login(loginDto);

      expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset OTP', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const mockForgotPasswordResponse = {
        message: 'OTP sent for password reset',
      };

      jest
        .spyOn(authServiceMock, 'forgotPassword')
        .mockResolvedValue(mockForgotPasswordResponse);

      const result = await authController.forgotPassword(forgotPasswordDto);

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
      expect(result).toEqual(mockForgotPasswordResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'NewStrongPassword123!',
      };

      const mockResetPasswordResponse = {
        message: 'Password reset successfully',
      };

      jest
        .spyOn(authServiceMock, 'resetPassword')
        .mockResolvedValue(mockResetPasswordResponse);

      const result = await authController.resetPassword(resetPasswordDto);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
      );
      expect(result).toEqual(mockResetPasswordResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'existing-refresh-token',
      };

      const mockRefreshTokenResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      jest
        .spyOn(authServiceMock, 'refreshToken')
        .mockResolvedValue(mockRefreshTokenResponse);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockRefreshTokenResponse);
    });
  });

  describe('getProfile', () => {
    it('should retrieve user profile', async () => {
      const mockRequest = {
        user: {
          sub: 'user-id-123',
        },
      };

      const mockProfileResponse = {
        id: 'user-id-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileImageUrl: 'https://example.com/profile.jpg',
        profileImageId: 'profile-image-id',
        language: 'en',
      };

      jest
        .spyOn(authServiceMock, 'getProfile')
        .mockResolvedValue(mockProfileResponse);

      const result = await authController.getProfile(mockRequest);

      expect(authServiceMock.getProfile).toHaveBeenCalledWith(
        mockRequest.user.sub,
      );
      expect(result).toEqual(mockProfileResponse);
    });
  });
});
