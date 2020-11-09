import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Country } from './Country';
import { PersonResidesAddress } from './PersonResidesAddress';

@ObjectType()
@Entity('addresses')
export class Address extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Field()
  @Column({ name: 'address' })
  address: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Field(() => Country)
  @ManyToOne(() => Country, (country) => country.addresses, { nullable: false })
  @JoinColumn({ name: 'country' })
  country: Country;

  @OneToMany(
    () => PersonResidesAddress,
    (personResidesAddress: PersonResidesAddress) => personResidesAddress.address
  )
  personResidesAddress: PersonResidesAddress[];
}
