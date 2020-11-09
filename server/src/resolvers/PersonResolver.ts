import {
  Resolver,
  UseMiddleware,
  Query,
  Arg,
  Int,
  Mutation,
} from 'type-graphql';
import { Person } from '../entity/Person';
import { Address } from '../entity/Address';
import { isAuth } from '../isAuth';
import { getRepository } from 'typeorm';
import { PersonResidesAddress } from '../entity/PersonResidesAddress';
import { isClerk } from '../isClerk';
import { personSchema } from '../schema';

@Resolver()
export class PersonResolver {
  @Query(() => [Person])
  @UseMiddleware(isAuth)
  async persons() {
    const results = await Person.find();

    let ret: Person[] = [];

    for (let result of results) {
      ret = [...ret, result];
    }
    return ret;
  }

  @Query(() => Person, { nullable: true })
  @UseMiddleware(isAuth)
  async person(@Arg('id', () => Int) id: number) {
    const result = await getRepository(PersonResidesAddress)
      .createQueryBuilder('pra')
      .leftJoinAndSelect('pra.person', 'person')
      .leftJoinAndSelect('pra.address', 'address')
      .leftJoinAndSelect('address.country', 'country')
      .where('end_date is null')
      .andWhere('person.id = :id', { id })
      .getOne();

    if (!result) {
      return null;
    }

    return result;
  }

  @Query(() => Address, { nullable: true })
  @UseMiddleware(isAuth)
  async personAddress(
    @Arg('id', () => Int) id: number,
    @Arg('date', () => Date, { nullable: true }) date?: Date
  ) {
    if (!date) {
      const result = await getRepository(PersonResidesAddress)
        .createQueryBuilder('pra')
        .leftJoinAndSelect('pra.person', 'person')
        .leftJoinAndSelect('pra.address', 'address')
        .leftJoinAndSelect('address.country', 'country')
        .where('end_date is null')
        .andWhere('person.id = :id', { id })
        .getOne();

      if (!result) {
        return null;
      }

      return result.address;
    }

    let results = await getRepository(PersonResidesAddress)
      .createQueryBuilder('pra')
      .leftJoinAndSelect('pra.address', 'address')
      .leftJoinAndSelect('address.country', 'country')
      .andWhere('pra.person = :id', { id })
      .getMany();

    if (!results) {
      return null;
    }

    for (let addr of results) {
      const queryDate = date.getTime();
      const startDate = Date.parse(addr.startDate);

      if (addr.endDate) {
        const endDate = Date.parse(addr.endDate);
        if (startDate <= queryDate && queryDate <= endDate) {
          return addr.address;
        }
      } else {
        if (startDate <= queryDate) {
          return addr.address;
        }
      }
    }

    return null;
  }

  @Mutation(() => Person, { nullable: true })
  @UseMiddleware(isClerk)
  async addPerson(
    @Arg('rut', { nullable: true }) rut: string,
    @Arg('name') name: string,
    @Arg('division', { nullable: true }) division: string,
    @Arg('address', () => Int, { nullable: true }) address: number,
    @Arg('email', { nullable: true }) email: string,
    @Arg('phone', () => Int, { nullable: true }) phone: number
  ) {
    const person = { rut, name, division, email, phone };

    personSchema.validate(person).catch(() => {
      return {
        status: 'error',
      };
    });

    const newPerson = await getRepository(Person)
      .createQueryBuilder('person')
      .insert()
      .values({
        rut,
        name,
        division,
        email,
        phone,
      })
      .returning('*')
      .execute();

    if (address) {
      await getRepository(PersonResidesAddress)
        .createQueryBuilder('pra')
        .insert()
        .values({
          startDate: new Date().toDateString(),
          person: newPerson.generatedMaps[0].id,
          address: { id: address },
        })
        .execute();
    }

    return newPerson.generatedMaps[0];
  }
}
