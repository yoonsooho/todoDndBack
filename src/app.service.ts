import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getPing(): { status: string } {
    return { status: 'alive' };
  }
}
