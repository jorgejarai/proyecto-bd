import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
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
  @Column({ name: 'blob' })
  blob: string;

  @ManyToOne(() => Document, { eager: true, nullable: false })
  @JoinColumn({ name: 'document' })
  document: Document;
}

@ObjectType()
@Entity('file_media_types')
export class FileMediaType extends BaseEntity {
  @PrimaryColumn()
  @OneToOne(() => File, { nullable: false })
  @JoinColumn({ name: 'file' })
  file: File;

  @Field()
  @Column({ name: 'media_type' })
  mediaType: string;
}
