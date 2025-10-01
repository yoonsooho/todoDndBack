// src/content/content-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Entity('content_items')
export class ContentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'int', generated: 'increment' })
  seq: number;

  @ManyToOne(() => Post, (post) => post.contentItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  post: Post;
}
