import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Schedule } from 'src/schedule/schedule.entity';
import { ContentItem } from 'src/content-item/content-item.entity';

@Entity('posts')
export class Post {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'integer', nullable: false })
  seq: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @OneToMany(() => ContentItem, (contentItem) => contentItem.post)
  contentItems: ContentItem[];
}
