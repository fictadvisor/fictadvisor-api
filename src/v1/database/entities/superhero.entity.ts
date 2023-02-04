import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne, PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SuperheroState {
  PENDING = 'pending',
  APPROVED = 'approved',
  HIDDEN = 'hidden',
}

@Entity('superheroes')
export class Superhero extends BaseEntity {

  @PrimaryColumn()
    user_id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
    user: User;

  @Column()
    name: string;

  @Column()
    username: string;

  @Column({ type: 'smallint' })
    year: number;

  @Column({ default: false })
    dorm: boolean;

  @Column({ type: 'varchar', default: SuperheroState.PENDING })
    state: SuperheroState;

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
