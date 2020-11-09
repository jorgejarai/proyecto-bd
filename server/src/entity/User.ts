import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Document } from './Document';
// import { UserRecordsDocuments } from './UserRecordsDocuments';

@ObjectType()
@Entity('users')
@Unique(['email', 'username'])
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ name: 'username' })
  username: string;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field()
  @Column({ name: 'email' })
  email: string;

  @Field(() => String, { nullable: true })
  @Field(() => String)
  @Column({ name: 'division', nullable: true })
  division?: string;

  @Field()
  @Column({ name: 'is_clerk' })
  isClerk: boolean;

  @Column({ name: 'password' })
  password: string;

  @Column('int', { name: 'token_version', default: 0 })
  tokenVersion: number;

  @OneToMany(() => Document, (document) => document.recordedBy)
  documents: Document[];
  // @OneToMany(
  //   () => UserRecordsDocuments,
  //   (userRecordsDocuments) => userRecordsDocuments.user
  // )
  // userRecordsDocuments: UserRecordsDocuments[];
}

// vim: ts=2 sw=2 et
