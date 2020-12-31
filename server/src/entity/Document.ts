import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { DocumentType } from './DocumentType';
import { User } from './User';
import { Person } from './Person';
import { File } from './File';

@ObjectType()
@Entity('documents')
export class Document extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field({ nullable: true })
  @Column({ name: 'doc_number', nullable: true })
  docNumber: string;

  @Field()
  @Column({ name: 'subject' })
  subject: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'written_on', type: 'date', nullable: true })
  writtenOn?: string;

  @Field(() => DocumentType)
  @ManyToOne(() => DocumentType, (documentType) => documentType.documents, {
    nullable: false,
  })
  @JoinColumn({ name: 'doc_type' })
  docType: DocumentType;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.documents, { nullable: false })
  @JoinColumn({ name: 'recorded_by' })
  recordedBy: User;

  @Field(() => Person)
  @ManyToOne(() => Person, { nullable: false })
  @JoinColumn({ name: 'sender' })
  sender: Person;

  @Field(() => String, { nullable: true })
  @Column({ name: 'sent_on', type: 'date', nullable: true })
  sentOn?: string;

  @OneToMany(() => File, (file) => file.document)
  files: File[];
}
