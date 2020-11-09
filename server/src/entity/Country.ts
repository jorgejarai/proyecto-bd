import {
  Entity,
  BaseEntity,
  Unique,
  Column,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Address } from './Address';

@ObjectType()
@Entity('countries')
@Unique(['countryNumber'])
export class Country extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn({ name: 'country_number' })
  countryNumber: number;

  @Field()
  @Column({ name: 'name' })
  name: string;

  @Field()
  @Column({ name: 'iso_name' })
  isoName: string;

  @Field()
  @Column({ name: 'alpha2' })
  alpha2: string;

  @Field()
  @Column({ name: 'alpha3' })
  alpha3: string;

  @OneToMany(() => Address, (address) => address.country)
  addresses: Address[];
}
