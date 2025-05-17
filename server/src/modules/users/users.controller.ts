import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from '../../common/gurads/roles.guard';
import { Roles } from '../../common/decorators/roles/roles.decorator';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/users.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @desc    create a new user (Admin only)
   * @route   POST /users
   * @access  Private (Admin only)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * @desc    Get all users (Admin only)
   * @route   GET /users
   * @access  Private (Admin only)
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page, limit);
  }

  /**
   * @desc    Get current user profile
   * @route   GET /users/profile
   * @access  Private
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@Req() req) {
    return this.usersService.findOne(req.user.sub);
  }

  /**
   * @desc    Get current user bookings
   * @route   GET /users/bookings
   * @access  Private
   */
  @Get('bookings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({
    status: 200,
    description: 'User bookings retrieved successfully',
  })
  async getUserBookings(@Req() req) {
    return this.usersService.getUserBookings(req.user.sub);
  }

  /**
   * @desc    Get user by ID (Admin only)
   * @route   GET /users/:id
   * @access  Private (Admin only)
   */
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * @desc    Update user (Admin only)
   * @route   PATCH /users/:id
   * @access  Private (Admin only)
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * @desc    Update user profile
   * @route   PATCH /users/profile
   * @access  Private
   */
  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  /**
   * @desc    update user avatar
   * @route   PATCH /users/profile/avatar
   * @access  private
   */
  @Patch('profile/avatar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({
    status: 200,
    description: 'User avatar updated successfully',
    type: UserResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['avatar'],
    },
  })
  async updateAvatar(@Req() req, @UploadedFile() avatar) {
    return this.usersService.updateAvatar(req.user.sub, avatar);
  }

  /**
   * @desc    Delete user (Admin only)
   * @route   Delete /users/:id
   * @access  Private (Admin only)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * @desc    Get Admin Stats for dashboard
   * @route   DELETE /users/admin/stats
   * @access  Private (Admin only)
   */
  @Get('admin/stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Admin Stats for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Admin stats retrieved successfully',
  })
  async getAdminStats() {
    return this.usersService.getAdminStats();
  }
}
