import { Test, TestingModule } from '@nestjs/testing';
import { ContentItemService } from './content-item.service';

describe('ContentItemService', () => {
  let service: ContentItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentItemService],
    }).compile();

    service = module.get<ContentItemService>(ContentItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
