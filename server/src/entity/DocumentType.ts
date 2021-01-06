import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Document } from './Document';

@ObjectType()
@Entity('document_type')
export class DocumentType extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ name: 'type_name' })
  typeName: string;

  @OneToMany(() => Document, (document) => document.docType)
  documents: Document[];
}
