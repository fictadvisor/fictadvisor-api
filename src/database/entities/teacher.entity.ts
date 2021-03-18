import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('teachers')
export class Teacher extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true })
    link: string;

    @Column({ name: 'first_name', type: 'varchar' })
    firstName: string;

    @Column({ name: 'middle_name', type: 'varchar', nullable: true })
    middleName?: string;

    @Column({ name: 'last_name', type: 'varchar' })
    lastName?: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', array: true, default: '{}' })
    tags: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
};