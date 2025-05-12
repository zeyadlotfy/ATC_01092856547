import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { addMinutes } from 'date-fns';
import { EmailService } from '../email/email.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { EmailValidator } from '../../common/utils/email-validator.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Register a new user and send verification OTP
   */
  async register(registerDto: RegisterDto) {
    const isValidEmail = await EmailValidator.isValidEmail(registerDto.email);

    if (!isValidEmail) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser && existingUser.isActive) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);

    const { otp, expiry } = this.generateOTP();

    let user: User;

    if (existingUser) {
      user = await this.prisma.user.update({
        where: { email: registerDto.email },
        data: {
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          password: hashedPassword,
          OTP: otp,
          OTPExpiry: expiry,
          isActive: false,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          password: hashedPassword,
          OTP: otp,
          OTPExpiry: expiry,
          isActive: false,
        },
      });
    }

    await this.emailService.sendMail({
      subject: 'Activate your account',
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      activationCode: otp,
      template: './activation',
    });

    return {
      message:
        'Registration successful. Please check your email for OTP verification.',
    };
  }

  /**
   * Verify user with OTP
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.OTP || !user.OTPExpiry) {
      throw new BadRequestException('No OTP found for this user');
    }

    if (user.OTPExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.OTP !== verifyOtpDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        OTP: null,
        OTPExpiry: null,
      },
    });

    const tokens = await this.generateTokens(updatedUser);

    return {
      user: this.sanitizeUser(updatedUser),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Forgot password - send OTP
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found or account not active');
    }

    const { otp, expiry } = this.generateOTP();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        OTP: otp,
        OTPExpiry: expiry,
      },
    });

    await this.emailService.sendMail({
      subject: 'Password Reset OTP',
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      activationCode: otp,
      template: './password',
    });

    return {
      message: 'Password reset OTP has been sent to your email',
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found or account not active');
    }

    if (!user.OTP || !user.OTPExpiry) {
      throw new BadRequestException('No OTP found for this user');
    }

    if (user.OTPExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.OTP !== resetPasswordDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await this.hashPassword(
      resetPasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        OTP: null,
        OTPExpiry: null,
      },
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Find refresh token in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (tokenRecord.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { id: tokenRecord.id },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = tokenRecord.user;

      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Get user profile data
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account not active');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Generate OTP for verification/reset
   */
  private generateOTP() {
    const otp = crypto.randomInt(100000, 999999).toString();

    const expiry = addMinutes(new Date(), 30);

    return { otp, expiry };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomBytes(40).toString('hex');

    const expiresAt = addMinutes(new Date(), 7 * 24 * 60);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        userId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { password, OTP, OTPExpiry, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }
}
