import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request } from 'express';
import {
  AuthResponseDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { AuthGuard } from '../../common/gurads/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * @desc    Register a new user
   * @route   POST /auth/register
   * @access  Public
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully. Verification OTP sent.',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.debug(`Registering new user with email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  /**
   * @desc    Verify user with OTP
   * @route   POST /auth/verify-otp
   * @access  Public
   */
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify user with OTP' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User verified successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired OTP',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.debug(`Verifying OTP for email: ${verifyOtpDto.email}`);
    return this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * @desc    Login user
   * @route   POST /auth/login
   * @access  Public
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or inactive account',
  })
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`User login attempt: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  /**
   * @desc    Forgot password
   * @route   POST /auth/forgot-password
   * @access  Public
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password - sends OTP to reset password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset OTP sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found or account not active',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.logger.debug(
      `Password reset requested for: ${forgotPasswordDto.email}`,
    );
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * @desc    Reset password
   * @route   POST /auth/reset-password
   * @access  Public
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired OTP',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.debug(`Reset password for: ${resetPasswordDto.email}`);
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * @desc    Refresh access token
   * @route   POST /auth/refresh-token
   * @access  Public
   */
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.debug('Refreshing access token');
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * @desc    Get user profile
   * @route   GET /auth/profile
   * @access  Private
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async getProfile(@Req() req) {
    this.logger.debug('Fetching user profile');
    return await this.authService.getProfile(req.user.sub);
  }
}
