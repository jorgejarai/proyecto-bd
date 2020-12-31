import {
  Resolver,
  UseMiddleware,
  Query,
  Arg,
  Int,
  Mutation,
  Field,
  ObjectType,
  InputType,
} from 'type-graphql';
import { Person } from '../entity/Person';
import { Address } from '../entity/Address';
import { isAuth } from '../isAuth';
import { getRepository, getConnection } from 'typeorm';
import { PersonResidesAddress } from '../entity/PersonResidesAddress';
import { isClerk } from '../isClerk';
import { personSchema } from '../schema';
import { StatusResponse } from '../StatusResponse';

@ObjectType()
export class PersonOutput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  rut?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  division?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
class PersonResponse {
  @Field(() => PersonOutput, { nullable: true })
  person?: PersonOutput;

  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => Address, { nullable: true })
  address?: Address;
}

@ObjectType()
class PersonNameResponse {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  label: string;
}

@InputType()
class PersonUpdateInput {
  @Field(() => Int, { nullable: true })
  rutNum?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  division?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;
}

@Resolver()
export class PersonResolver {
  @Query(() => [PersonResponse])
  @UseMiddleware(isAuth)
  async persons() {
    const results = await getRepository(PersonResidesAddress)
      .createQueryBuilder('pra')
      .leftJoinAndSelect('pra.person', 'person')
      .leftJoinAndSelect('pra.address', 'address')
      .leftJoinAndSelect('address.country', 'country')
      .where('end_date is null')
      .getMany();

    let ret: PersonResponse[] = [];

    for (let { person, address } of results) {
      const { id, rutNum, rutDv, name, division, phone, email } = person;
      ret = [
        ...ret,
        {
          status: {
            status: 'ok',
          },
          person: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
          address,
        },
      ];
    }

    return ret;
  }

  @Query(() => PersonResponse, { nullable: true })
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
      return {
        status: 'error',
      };
    }

    return {
      ...result,
      person: {
        ...result.person,
        rut: `${result.person.rutNum}-${result.person.rutDv}`,
      },
    };
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

  @Query(() => [PersonResponse])
  @UseMiddleware(isAuth)
  async personsAddresses(
    @Arg('ids', () => [Int]) ids: number[],
    @Arg('date', () => Date, { nullable: true }) date?: Date
  ) {
    let ret: PersonResponse[] = [];

    for (let id of ids) {
      let result: PersonResidesAddress | undefined;

      if (!date) {
        result = await getRepository(PersonResidesAddress)
          .createQueryBuilder('pra')
          .leftJoinAndSelect('pra.person', 'person')
          .leftJoinAndSelect('pra.address', 'address')
          .leftJoinAndSelect('address.country', 'country')
          .where('end_date is null')
          .andWhere('person.id = :id', { id })
          .getOne();

        if (!result) {
          ret = [
            ...ret,
            {
              person: { id },
              status: {
                status: 'error',
                message: 'Person not found',
              },
            },
          ];
        } else {
          const {
            id,
            rutNum,
            rutDv,
            name,
            division,
            phone,
            email,
          } = result.person;
          ret = [
            ...ret,
            {
              person: {
                id,
                name,
                division,
                phone,
                email,
                rut: `${rutNum}-${rutDv}`,
              },
              status: {
                status: 'ok',
              },
              address: result.address,
            },
          ];
        }
      } else {
        // FIXME: Funciona así como está, pero eventualmente podría simplificarse para obtener la dirección en la fecha pedida directamente en la petición SQL
        const results = await getRepository(PersonResidesAddress)
          .createQueryBuilder('pra')
          .leftJoinAndSelect('pra.person', 'person')
          .leftJoinAndSelect('pra.address', 'address')
          .leftJoinAndSelect('address.country', 'country')
          .andWhere('pra.person = :id', { id })
          .getMany();

        if (!results || results.length === 0) {
          ret = [
            ...ret,
            {
              person: { id },
              status: {
                status: 'error',
                message: `Person no. ${id} has no associated addresses (this should happen, like, at all)`,
              },
            },
          ];
          continue;
        }

        let personWasAdded = false;
        for (let result of results) {
          const queryDate = date.getTime();
          const startDate = Date.parse(result.startDate);

          if (result.endDate) {
            const endDate = Date.parse(result.endDate);
            if (startDate <= queryDate && queryDate <= endDate) {
              const {
                id,
                rutNum,
                rutDv,
                name,
                division,
                phone,
                email,
              } = result.person;
              ret = [
                ...ret,
                {
                  person: {
                    id,
                    name,
                    division,
                    phone,
                    email,
                    rut: `${rutNum}-${rutDv}`,
                  },
                  status: {
                    status: 'ok',
                  },
                  address: result.address,
                },
              ];
              personWasAdded = true;
              break;
            }
          } else {
            if (startDate <= queryDate) {
              const {
                id,
                rutNum,
                rutDv,
                name,
                division,
                phone,
                email,
              } = result.person;
              ret = [
                ...ret,
                {
                  person: {
                    id,
                    name,
                    division,
                    phone,
                    email,
                    rut: `${rutNum}-${rutDv}`,
                  },
                  status: {
                    status: 'ok',
                  },
                  address: result.address,
                },
              ];
              personWasAdded = true;
              break;
            }
          }

          if (!personWasAdded) {
            ret = [
              ...ret,
              {
                person: { id },
                status: {
                  status: 'error',
                  message: 'Person not found',
                },
              },
            ];
          }
        }
      }
    }

    return ret;
  }

  @Mutation(() => PersonResponse, { nullable: true })
  @UseMiddleware(isClerk)
  async addPerson(
    @Arg('rut', () => Int, { nullable: true }) rut: number,
    @Arg('name') name: string,
    @Arg('division', { nullable: true }) division: string,
    @Arg('address', () => Int, { nullable: true }) address: number,
    @Arg('email', { nullable: true }) email: string,
    @Arg('phone', () => String, { nullable: true }) phone: string
  ): Promise<PersonResponse | null | undefined> {
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
        rutNum: rut,
        name,
        division,
        email,
        phone,
      })
      .returning('*')
      .execute();

    let addressEntry;

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

      addressEntry = await getRepository(Address)
        .createQueryBuilder('addr')
        .leftJoinAndSelect('addr.country', 'country')
        .where('id = :id', { id: address })
        .getOne();
    }

    const {
      id,
      rutNum,
      rutDv,
      name: retName,
      division: retDivision,
      phone: retPhone,
      email: retEmail,
    } = newPerson.generatedMaps[0];
    return {
      status: {
        status: 'ok',
      },
      person: {
        id,
        name: retName,
        division: retDivision,
        phone: retPhone,
        email: retEmail,
        rut: `${rutNum}-${rutDv}`,
      },
      address: addressEntry,
    };
  }

  @Query(() => [PersonNameResponse])
  @UseMiddleware(isAuth)
  async personNames() {
    const persons = await getRepository(Person)
      .createQueryBuilder('per')
      .select(['id', 'name', 'division'])
      .getRawMany();

    let result: PersonNameResponse[] = [];

    persons.forEach((person) => {
      const { id, name, division } = person;

      if (division) {
        result = [...result, { id, label: `${name} - ${division}` }];
      } else {
        result = [...result, { id, label: name }];
      }
    });

    return result;
  }

  @Mutation(() => PersonResponse, { nullable: true })
  @UseMiddleware(isClerk)
  async updatePerson(
    @Arg('perId', () => Int) perId: number,
    @Arg('data', () => PersonUpdateInput) data: PersonUpdateInput
  ): Promise<PersonResponse | null | undefined> {
    const findResult = await getRepository(Person)
      .createQueryBuilder('per')
      .select([
        'per.rutNum',
        'per.name',
        'per.division',
        'per.phone',
        'per.email',
      ])
      .where('per.id = :perId', { perId })
      .getOne();

    if (!findResult) return null;

    let newData: any = { ...findResult, ...data };

    await getConnection()
      .createQueryBuilder()
      .update(Person)
      .set({ ...newData })
      .where('id = :perId', { perId })
      .execute();

    const checkResult = await getRepository(Person)
      .createQueryBuilder('per')
      .select([
        'per.rutNum',
        'per.rutDv',
        'per.name',
        'per.division',
        'per.phone',
        'per.email',
      ])
      .where('per.id = :perId', { perId })
      .getOne();

    return {
      status: {
        status: 'ok',
      },
      person: {
        id: perId,
        rut: `${checkResult?.rutNum}-${checkResult?.rutDv}`,
        name: checkResult?.name,
        division: checkResult?.division,
        phone: checkResult?.phone,
        email: checkResult?.phone,
      },
    };
  }

  @Mutation(() => PersonResponse)
  @UseMiddleware(isClerk)
  async updateAddress(
    @Arg('person', () => Int) person: number,
    @Arg('address', () => String) address: string,
    @Arg('postalCode', () => String, { nullable: true })
    postalCode: string | undefined,
    @Arg('country', () => Int) country: number
  ): Promise<PersonResponse> {
    const checkPerson = await getRepository(Person)
      .createQueryBuilder('per')
      .select('per.id')
      .where('id = :person', { person })
      .getOne();

    if (!checkPerson) {
      return {
        status: {
          status: 'error',
          message: 'Person not found',
        },
      };
    }

    const newAddressResult = await getRepository(Address)
      .createQueryBuilder('addr')
      .insert()
      .values({
        address,
        postalCode,
        country: { countryNumber: country },
      })
      .returning('id')
      .execute();

    if (!newAddressResult.generatedMaps[0].id) {
      return {
        status: {
          status: 'error',
          message: 'Address could not be updated',
        },
      };
    }

    const updateResult = await getConnection()
      .createQueryBuilder()
      .update(PersonResidesAddress)
      .set({ endDate: new Date().toISOString() })
      .where('person = :person', { person })
      .andWhere('end_date is null')
      .execute();

    if (updateResult.affected === 0) {
      return {
        status: {
          status: 'error',
          message: 'Address could not be updated',
        },
      };
    }

    const insertResult = await getRepository(PersonResidesAddress)
      .createQueryBuilder('pra')
      .insert()
      .values({
        person: { id: person },
        address: newAddressResult.generatedMaps[0].id,
        startDate: new Date().toISOString(),
      })
      .returning('id')
      .execute();

    if (!insertResult.generatedMaps[0].id) {
      return {
        status: {
          status: 'error',
          message: 'Address could not be updated',
        },
      };
    }

    const result = await getRepository(PersonResidesAddress)
      .createQueryBuilder('pra')
      .leftJoinAndSelect('pra.person', 'per')
      .leftJoinAndSelect('pra.address', 'addr')
      .leftJoinAndSelect('addr.country', 'coun')
      .where('pra.person = :id', { id: person })
      .getOne();

    return {
      status: {
        status: 'ok',
      },
      address: result?.address,
      person: {
        id: result?.person.id!,
        name: result?.person.name,
        division: result?.person.division,
        phone: result?.person.phone,
        email: result?.person.email,
        rut: `${result?.person.rutNum}-${result?.person.rutDv}`,
      },
    };
  }
}
