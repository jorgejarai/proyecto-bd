import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Field, InputType, Int } from "type-graphql";
import { PersonResidesAddress } from "./PersonResidesAddress";

@InputType("PersonInput")
@Entity("persons")
export class Person extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Field(() => Int, { nullable: true })
  rut?: number;

  @Column({ name: "rut", nullable: true })
  rutNum?: number;

  @Column({ type: "char", name: "dv", nullable: true })
  rutDv?: string;

  @Field()
  @Column({ name: "name" })
  name: string;

  @Field({ nullable: true })
  @Column({ name: "division", nullable: true })
  division?: string;

  @Field(() => Int, { nullable: true })
  @Column({ name: "phone", nullable: true })
  phone?: number;

  @Field({ nullable: true })
  @Column({ name: "email", nullable: true })
  email?: string;

  @OneToMany(
    () => PersonResidesAddress,
    (personResidesAddress: PersonResidesAddress) => personResidesAddress.person
  )
  personResidesAddress: PersonResidesAddress[];
}
