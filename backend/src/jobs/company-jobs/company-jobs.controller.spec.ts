import { Test, TestingModule } from '@nestjs/testing';
import { CompanyJobsController } from './company-jobs.controller';

describe('CompanyJobsController', () => {
  let controller: CompanyJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyJobsController],
    }).compile();

    controller = module.get<CompanyJobsController>(CompanyJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
