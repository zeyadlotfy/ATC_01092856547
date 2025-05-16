import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import {
  CreateTagDto,
  TagListResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from './dtos/tag.dto';
import { Logger } from '@nestjs/common';

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

describe('TagController', () => {
  let tagController: TagController;
  let tagService: TagService;

  const mockTagService = {
    createTag: jest.fn(),
    getAllTags: jest.fn(),
    getTagById: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
  };

  const mockTag: TagResponseDto = {
    id: '1',
    name: 'Test Tag',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
    }).compile();

    tagController = module.get<TagController>(TagController);
    tagService = module.get<TagService>(TagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tagController).toBeDefined();
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {
      const createTagDto: CreateTagDto = { name: 'New Tag' };
      mockTagService.createTag.mockResolvedValue(mockTag);

      const result = await tagController.createTag(createTagDto);

      expect(tagService.createTag).toHaveBeenCalledWith(createTagDto);
      expect(result).toEqual(mockTag);
    });
  });

  describe('getTagById', () => {
    it('should get a tag by id', async () => {
      const tagId = '1';
      mockTagService.getTagById.mockResolvedValue(mockTag);

      const result = await tagController.getTagById(tagId);

      expect(tagService.getTagById).toHaveBeenCalledWith(tagId);
      expect(result).toEqual(mockTag);
    });
  });

  describe('updateTag', () => {
    it('should update a tag', async () => {
      const tagId = '1';
      const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };
      const updatedMockTag = { ...mockTag, name: 'Updated Tag' };

      mockTagService.updateTag.mockResolvedValue(updatedMockTag);

      const result = await tagController.updateTag(tagId, updateTagDto);

      expect(tagService.updateTag).toHaveBeenCalledWith(tagId, updateTagDto);
      expect(result).toEqual(updatedMockTag);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      const tagId = '1';
      mockTagService.deleteTag.mockResolvedValue(undefined);

      const result = await tagController.deleteTag(tagId);

      expect(tagService.deleteTag).toHaveBeenCalledWith(tagId);
      expect(result).toEqual({ message: 'Tag deleted successfully' });
    });
  });
});
