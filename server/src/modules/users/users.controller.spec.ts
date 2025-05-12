import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dtos/users.dto';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from '../../common/gurads/roles.guard';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser: UserResponseDto = {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test User First',
    lastName: 'Test User Last',
    role: Role.USER,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false,
    language: '',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    role: Role.USER,
    firstName: 'Test User First',
    lastName: 'Test User Last',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    firstName: 'Updated Name',
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUserBookings: jest.fn(),
            updateAvatar: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await usersController.create(mockCreateUserDto);

      expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = { user: { sub: 'user123' } };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await usersController.getProfile(mockRequest);

      expect(usersService.findOne).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await usersController.findOne('user123');

      expect(usersService.findOne).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await usersController.update('user123', mockUpdateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(
        'user123',
        mockUpdateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockRequest = { user: { sub: 'user123' } };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await usersController.updateProfile(
        mockRequest,
        mockUpdateUserDto,
      );

      expect(usersService.update).toHaveBeenCalledWith(
        'user123',
        mockUpdateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user by ID', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);

      const result = await usersController.remove('user123');

      expect(usersService.remove).toHaveBeenCalledWith('user123');
      expect(result).toBeUndefined();
    });
  });

  describe('Authorization', () => {
    it('should require admin role for create method', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersController.prototype.create,
      );
      expect(metadata).toContain(Role.ADMIN);
    });

    it('should require admin role for findAll method', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        UsersController.prototype.findAll,
      );
      expect(metadata).toContain(Role.ADMIN);
    });

    it('should require authentication for profile-related methods', () => {
      const profileGuards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.getProfile,
      );
      expect(profileGuards).toContain(AuthGuard);
    });
  });
});
