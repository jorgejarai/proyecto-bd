import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { PersonResidesAddress } from './PersonResidesAddress';

@ObjectType()
@Entity('persons')
export class Person extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'rut', nullable: true })
  rut?: string;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'division', nullable: true })
  division?: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'phone', nullable: true })
  phone?: number;

  @Field(() => String, { nullable: true })
  @Column({ name: 'email', nullable: true })
  email?: string;

  @OneToMany(
    () => PersonResidesAddress,
    (personResidesAddress: PersonResidesAddress) => personResidesAddress.person
  )
  personResidesAddress: PersonResidesAddress[];
}
