import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Document } from './Document';
import { Person } from './Person';

@ObjectType()
@Entity('document_person')
export class DocumentPerson extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ type: 'date', name: 'received_on' })
  receivedOn: string;

  @ManyToOne(() => Person, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'recipient' })
  recipient: Person;

  @ManyToOne(() => Document, { eager: true, nullable: false })
  @JoinColumn({ name: 'document' })
  document: Document;
}
