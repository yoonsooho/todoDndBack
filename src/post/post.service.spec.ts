import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './post.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostService', () => {
  let service: PostService;
  let postRepository: Repository<Post>;
  let scheduleRepository: Repository<Schedule>;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    schedule: { id: 1, title: 'Test Schedule' },
    contentItems: [],
  };

  const mockSchedule = {
    id: 1,
    title: 'Test Schedule',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockScheduleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockScheduleRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    scheduleRepository = module.get<Repository<Schedule>>(getRepositoryToken(Schedule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        schedule_id: 1,
      };

      mockScheduleRepository.findOne.mockResolvedValue(mockSchedule);
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto);

      expect(mockScheduleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        title: 'Test Post',
        schedule: mockSchedule,
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        schedule_id: 999,
      };

      mockScheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPostDto)).rejects.toThrow(
        new NotFoundException('Schedule with ID 999 not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostRepository.find.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(mockPostRepository.find).toHaveBeenCalledWith({
        relations: ['schedule', 'contentItems'],
      });
      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['schedule', 'contentItems'],
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Post with ID 999 not found'),
      );
    });
  });

  describe('update', () => {
    it('should update a post successfully', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({ ...mockPost, title: 'Updated Post' });

      const result = await service.update(1, updatePostDto);

      expect(result.title).toBe('Updated Post');
    });
  });

  describe('remove', () => {
    it('should remove a post successfully', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(mockPost);

      await service.remove(1);

      expect(mockPostRepository.remove).toHaveBeenCalledWith(mockPost);
    });
  });
});
