import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  booking: {
    findMany: jest.fn(),
  },
};

const mockCloudinaryService = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const createdUser = {
        id: 'user-id',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          password: expect.any(String),
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        }),
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-id',
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        }),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', firstName: 'John' },
        { id: '2', email: 'user2@example.com', firstName: 'Jane' },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prismaService.user.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        totalPages: 1,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('user-id');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('user-id', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: updateUserDto,
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found during update', async () => {
      (prismaService.user.update as jest.Mock).mockRejectedValue(
        new Error('Not Found'),
      );

      await expect(service.update('non-existent-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        profileImageId: null,
      };
      const mockAvatar = {} as File;
      const mockUploadResult = {
        url: 'https://example.com/avatar.jpg',
        public_id: 'cloudinary-public-id',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      (cloudinaryService.uploadFile as jest.Mock).mockResolvedValue(
        mockUploadResult,
      );

      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        profileImageUrl: mockUploadResult.url,
        profileImageId: mockUploadResult.public_id,
      });

      const result = await service.updateAvatar(userId, mockAvatar);

      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockAvatar);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          profileImageUrl: mockUploadResult.url,
          profileImageId: mockUploadResult.public_id,
        },
      });
      expect(result).toEqual({ message: 'Avatar updated successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateAvatar('non-existent-id', {} as Express.Multer.File),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if upload fails', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        profileImageId: null,
      };
      const mockAvatar = {} as Express.Multer.File;

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      (cloudinaryService.uploadFile as jest.Mock).mockResolvedValue(null);

      await expect(service.updateAvatar(userId, mockAvatar)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue({});

      await service.remove('user-id');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });

    it('should throw NotFoundException if user not found during deletion', async () => {
      (prismaService.user.delete as jest.Mock).mockRejectedValue(
        new Error('Not Found'),
      );

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings', async () => {
      const userId = 'user-id';
      const mockBookings = [
        {
          id: 'booking-1',
          userId,
          event: { id: 'event-1', title: 'Test Event' },
        },
        {
          id: 'booking-2',
          userId,
          event: { id: 'event-2', title: 'Another Event' },
        },
      ];

      (prismaService.booking.findMany as jest.Mock).mockResolvedValue(
        mockBookings,
      );

      const result = await service.getUserBookings(userId);

      expect(result).toEqual(mockBookings);
      expect(prismaService.booking.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          event: true,
        },
      });
    });
  });
});
