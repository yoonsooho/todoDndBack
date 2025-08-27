// src/content/content-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from 'src/post/post.entity';

@Entity('content_items')
export class ContentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  text: string;

  @ManyToOne(() => Post, (post) => post.contentItems, { nullable: false })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
