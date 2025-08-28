import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshToken?: string;

  @Column({ nullable: true })
  socialId?: string;

  @Column({ nullable: true })
  social?: string;

  @OneToMany(() => ScheduleUser, (scheduleUser) => scheduleUser.user)
  scheduleUsers: ScheduleUser[];
}
