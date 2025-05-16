import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTagDto, TagResponseDto, UpdateTagDto } from './dtos/tag.dto';

jest.mock('@nestjs/common', () => {
  const originalModule = jest.requireActual('@nestjs/common');
  return {
    ...originalModule,
    Logger: jest.fn().mockImplementation(() => ({
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    })),
  };
});

describe('TagService', () => {
  let service: TagService;
  let prismaService: PrismaService;

  const mockTag: TagResponseDto = {
    id: '1',
    name: 'Test Tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTagList = [
    mockTag,
    {
      id: '2',
      name: 'Another Tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    tag: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTag', () => {
    const createTagDto: CreateTagDto = { name: 'New Tag' };

    it('should create a tag successfully', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.createTag(createTagDto);

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { name: createTagDto.name },
      });
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: createTagDto,
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException if tag with same name exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      await expect(service.createTag(createTagDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should propagate other errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.tag.findUnique.mockRejectedValue(error);

      await expect(service.createTag(createTagDto)).rejects.toThrow(error);
    });
  });

  describe('getAllTags', () => {
    it('should return paginated tags without search', async () => {
      mockPrismaService.tag.findMany.mockResolvedValue(mockTagList);
      mockPrismaService.tag.count.mockResolvedValue(mockTagList.length);

      const result = await service.getAllTags({});

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.tag.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        data: mockTagList,
        total: mockTagList.length,
      });
    });

    it('should return paginated tags with search', async () => {
      const search = 'test';
      const page = 2;
      const limit = 5;

      mockPrismaService.tag.findMany.mockResolvedValue([mockTagList[0]]);
      mockPrismaService.tag.count.mockResolvedValue(1);

      const result = await service.getAllTags({ search, page, limit });

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { nameAr: { contains: search, mode: 'insensitive' } },
          ],
        },
        skip: 5,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: [mockTagList[0]],
        total: 1,
      });
    });

    it('should handle errors during fetching tags', async () => {
      const error = new Error('Database error');
      mockPrismaService.tag.findMany.mockRejectedValue(error);

      await expect(service.getAllTags({})).rejects.toThrow(error);
    });
  });

  describe('getTagById', () => {
    it('should return a tag when it exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.getTagById('1');

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw NotFoundException when tag does not exist', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.getTagById('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate other errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.tag.findUnique.mockRejectedValue(error);

      await expect(service.getTagById('1')).rejects.toThrow(error);
    });
  });

  describe('updateTag', () => {
    const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };

    it('should update a tag successfully', async () => {
      const updatedTag = { ...mockTag, ...updateTagDto };
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue(null);
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.updateTag('1', updateTagDto);

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.tag.findFirst).toHaveBeenCalledWith({
        where: {
          name: updateTagDto.name,
          id: { not: '1' },
        },
      });
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTagDto,
      });
      expect(result).toEqual(updatedTag);
    });

    it('should throw NotFoundException when tag does not exist', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.updateTag('999', updateTagDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.tag.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if another tag with the same name exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.findFirst.mockResolvedValue({
        id: '2',
        name: updateTagDto.name,
      });

      await expect(service.updateTag('1', updateTagDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.tag.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag successfully', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.event.count.mockResolvedValue(0);
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      await service.deleteTag('1');

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.event.count).toHaveBeenCalledWith({
        where: {
          tagIds: {
            has: '1',
          },
        },
      });
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when tag does not exist', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.deleteTag('999')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.tag.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when tag is associated with events', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.event.count.mockResolvedValue(2);

      await expect(service.deleteTag('1')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.tag.delete).not.toHaveBeenCalled();
    });
  });
});
