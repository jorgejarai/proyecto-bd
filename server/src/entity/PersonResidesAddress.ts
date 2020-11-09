import {
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Person } from './Person';
import { Address } from './Address';

@ObjectType()
@Entity('person_resides_address')
export class PersonResidesAddress extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Field()
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string;

  @ManyToOne(() => Person, (person) => person.personResidesAddress, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'person' })
  person: Person;

  @ManyToOne(() => Address, (address) => address.personResidesAddress, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'address' })
  address: Address;
}
