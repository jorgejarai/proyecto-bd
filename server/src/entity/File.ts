import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Document } from './Document';

@ObjectType()
@Entity('files')
export class File extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ name: 'description' })
  description: string;

  @Field()
  @Column({ name: 'media_type' })
  mediaType: string;

  @Field()
  @Column({ name: 'blob' })
  blob: string;

  @Field()
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @ManyToOne(() => Document, { eager: true, nullable: false })
  @JoinColumn({ name: 'document' })
  document: Document;
}
