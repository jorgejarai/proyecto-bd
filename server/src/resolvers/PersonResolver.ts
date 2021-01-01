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
// import { personSchema } from '../schema';
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

  @Field(() => Address, { nullable: true })
  address?: Address;
}

@ObjectType()
class PersonResponse {
  @Field(() => PersonOutput, { nullable: true })
  person?: PersonOutput;

  @Field(() => StatusResponse)
  status: StatusResponse;
}

@ObjectType()
class PersonsResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [PersonOutput])
  persons: PersonOutput[];
}

@ObjectType()
class PersonNameOutput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  label: string;
}

@ObjectType()
class PersonNamesResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [PersonNameOutput])
  personNames: PersonNameOutput[];
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
  @Query(() => PersonsResponse)
  @UseMiddleware(isAuth)
  async persons(): Promise<PersonsResponse> {
    try {
      const results = await getRepository(PersonResidesAddress)
        .createQueryBuilder('pra')
        .leftJoinAndSelect('pra.person', 'person')
        .leftJoinAndSelect('pra.address', 'address')
        .leftJoinAndSelect('address.country', 'country')
        .where('end_date is null')
        .getMany();

      let persons: PersonOutput[] = [];

      for (let { person, address } of results) {
        const { id, rutNum, rutDv, name, division, phone, email } = person;
        persons = [
          ...persons,
          {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
            address,
          },
        ];
      }

      return {
        status: {
          status: 'ok',
        },
        persons,
      };
    } catch (e) {
      console.log(e);

      return {
        status: {
          status: 'error',
          message: 'Could not get persons',
        },
        persons: [],
      };
    }
  }

  @Query(() => PersonResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async person(@Arg('id', () => Int) id: number) {
    try {
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
          status: {
            status: 'error',
            message: 'Person not found',
          },
        };
      }

      return {
        person: {
          ...result.person,
          rut: `${result.person.rutNum}-${result.person.rutDv}`,
          address: result.address,
        },
        status: {
          status: 'ok',
        },
      };
    } catch (e) {
      console.log(e);

      return {
        status: {
          status: 'error',
          message: 'Could not get person',
        },
      };
    }
  }

  // @Query(() => Address, { nullable: true })
  // @UseMiddleware(isAuth)
  // async personAddress(
  //   @Arg('id', () => Int) id: number,
  //   @Arg('date', () => Date, { nullable: true }) date?: Date
  // ) {
  //   if (!date) {
  //     const result = await getRepository(PersonResidesAddress)
  //       .createQueryBuilder('pra')
  //       .leftJoinAndSelect('pra.person', 'person')
  //       .leftJoinAndSelect('pra.address', 'address')
  //       .leftJoinAndSelect('address.country', 'country')
  //       .where('end_date is null')
  //       .andWhere('person.id = :id', { id })
  //       .getOne();
  //
  //     if (!result) {
  //       return null;
  //     }
  //
  //     return result.address;
  //   }
  //
  //   let results = await getRepository(PersonResidesAddress)
  //     .createQueryBuilder('pra')
  //     .leftJoinAndSelect('pra.address', 'address')
  //     .leftJoinAndSelect('address.country', 'country')
  //     .andWhere('pra.person = :id', { id })
  //     .getMany();
  //
  //   if (!results) {
  //     return null;
  //   }
  //
  //   for (let addr of results) {
  //     const queryDate = date.getTime();
  //     const startDate = Date.parse(addr.startDate);
  //
  //     if (addr.endDate) {
  //       const endDate = Date.parse(addr.endDate);
  //       if (startDate <= queryDate && queryDate <= endDate) {
  //         return addr.address;
  //       }
  //     } else {
  //       if (startDate <= queryDate) {
  //         return addr.address;
  //       }
  //     }
  //   }
  //
  //   return null;
  // }

  // @Query(() => [PersonResponse])
  // @UseMiddleware(isAuth)
  // async personsAddresses(
  //   @Arg('ids', () => [Int]) ids: number[],
  //   @Arg('date', () => Date, { nullable: true }) date?: Date
  // ) {
  //   let ret: PersonResponse[] = [];
  //
  //   for (let id of ids) {
  //     let result: PersonResidesAddress | undefined;
  //
  //     if (!date) {
  //       result = await getRepository(PersonResidesAddress)
  //         .createQueryBuilder('pra')
  //         .leftJoinAndSelect('pra.person', 'person')
  //         .leftJoinAndSelect('pra.address', 'address')
  //         .leftJoinAndSelect('address.country', 'country')
  //         .where('end_date is null')
  //         .andWhere('person.id = :id', { id })
  //         .getOne();
  //
  //       if (!result) {
  //         ret = [
  //           ...ret,
  //           {
  //             person: { id },
  //             status: {
  //               status: 'error',
  //               message: 'Person not found',
  //             },
  //           },
  //         ];
  //       } else {
  //         const {
  //           id,
  //           rutNum,
  //           rutDv,
  //           name,
  //           division,
  //           phone,
  //           email,
  //         } = result.person;
  //         ret = [
  //           ...ret,
  //           {
  //             person: {
  //               id,
  //               name,
  //               division,
  //               phone,
  //               email,
  //               rut: `${rutNum}-${rutDv}`,
  //               address: result.address,
  //             },
  //             status: {
  //               status: 'ok',
  //             },
  //           },
  //         ];
  //       }
  //     } else {
  //       // FIXME: Funciona así como está, pero eventualmente podría simplificarse para obtener la dirección en la fecha pedida directamente en la petición SQL
  //       const results = await getRepository(PersonResidesAddress)
  //         .createQueryBuilder('pra')
  //         .leftJoinAndSelect('pra.person', 'person')
  //         .leftJoinAndSelect('pra.address', 'address')
  //         .leftJoinAndSelect('address.country', 'country')
  //         .andWhere('pra.person = :id', { id })
  //         .getMany();
  //
  //       if (!results || results.length === 0) {
  //         ret = [
  //           ...ret,
  //           {
  //             person: { id },
  //             status: {
  //               status: 'error',
  //               message: `Person no. ${id} has no associated addresses (this should happen, like, at all)`,
  //             },
  //           },
  //         ];
  //         continue;
  //       }
  //
  //       let personWasAdded = false;
  //       for (let result of results) {
  //         const queryDate = date.getTime();
  //         const startDate = Date.parse(result.startDate);
  //
  //         if (result.endDate) {
  //           const endDate = Date.parse(result.endDate);
  //           if (startDate <= queryDate && queryDate <= endDate) {
  //             const {
  //               id,
  //               rutNum,
  //               rutDv,
  //               name,
  //               division,
  //               phone,
  //               email,
  //             } = result.person;
  //             ret = [
  //               ...ret,
  //               {
  //                 person: {
  //                   id,
  //                   name,
  //                   division,
  //                   phone,
  //                   email,
  //                   rut: `${rutNum}-${rutDv}`,
  //                   address: result.address,
  //                 },
  //                 status: {
  //                   status: 'ok',
  //                 },
  //               },
  //             ];
  //             personWasAdded = true;
  //             break;
  //           }
  //         } else {
  //           if (startDate <= queryDate) {
  //             const {
  //               id,
  //               rutNum,
  //               rutDv,
  //               name,
  //               division,
  //               phone,
  //               email,
  //             } = result.person;
  //             ret = [
  //               ...ret,
  //               {
  //                 person: {
  //                   id,
  //                   name,
  //                   division,
  //                   phone,
  //                   email,
  //                   rut: `${rutNum}-${rutDv}`,
  //                   address: result.address,
  //                 },
  //                 status: {
  //                   status: 'ok',
  //                 },
  //               },
  //             ];
  //             personWasAdded = true;
  //             break;
  //           }
  //         }
  //
  //         if (!personWasAdded) {
  //           ret = [
  //             ...ret,
  //             {
  //               person: { id },
  //               status: {
  //                 status: 'error',
  //                 message: 'Person not found',
  //               },
  //             },
  //           ];
  //         }
  //       }
  //     }
  //   }
  //
  //   return ret;
  // }

  @Mutation(() => PersonResponse)
  @UseMiddleware(isClerk)
  async addPerson(
    @Arg('rut', () => Int, { nullable: true }) rut: number,
    @Arg('name') name: string,
    @Arg('division', { nullable: true }) division: string,
    @Arg('address', () => Int, { nullable: true }) address: number,
    @Arg('email', { nullable: true }) email: string,
    @Arg('phone', () => String, { nullable: true }) phone: string
  ): Promise<PersonResponse> {
    let ret: PersonResponse = {
      status: {
        status: 'error',
        message: 'Could not add person',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    // const person = { rut, name, division, email, phone };

    try {
      // personSchema.validate(person).catch(() => {
      //   ret.status = {
      //     status: 'error',
      //     message: 'Invalid format',
      //   };
      //
      //   throw new Error('Invalid person format');
      // });

      const newPerson = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .insert()
        .values({
          rutNum: rut,
          name,
          division,
          email,
          phone,
        })
        .returning('*') // TODO: corregir esto
        .execute();

      let addressEntry;

      if (address) {
        await queryRunner.manager
          .getRepository(PersonResidesAddress)
          .createQueryBuilder('pra')
          .insert()
          .values({
            startDate: new Date().toDateString(),
            person: newPerson.generatedMaps[0].id,
            address: { id: address },
          })
          .execute();

        addressEntry = await queryRunner.manager
          .getRepository(Address)
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

      ret = {
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
          address: addressEntry,
        },
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Query(() => PersonNamesResponse)
  @UseMiddleware(isAuth)
  async personNames(): Promise<PersonNamesResponse> {
    try {
      const persons = await getRepository(Person)
        .createQueryBuilder('per')
        .select(['id', 'name', 'division'])
        .getRawMany();

      let result: PersonNameOutput[] = [];

      persons.forEach((person) => {
        const { id, name, division } = person;

        if (division) {
          result = [...result, { id, label: `${name} - ${division}` }];
        } else {
          result = [...result, { id, label: name }];
        }
      });

      return {
        status: {
          status: 'ok',
        },
        personNames: result,
      };
    } catch (e) {
      console.log(e);
      return {
        status: {
          status: 'error',
          message: 'Could not get person names',
        },
        personNames: [],
      };
    }
  }

  @Mutation(() => PersonResponse)
  @UseMiddleware(isClerk)
  async updatePerson(
    @Arg('perId', () => Int) perId: number,
    @Arg('data', () => PersonUpdateInput) data: PersonUpdateInput
  ): Promise<PersonResponse> {
    let ret: PersonResponse = {
      status: {
        status: 'error',
        message: 'Could not update person',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const findResult = await queryRunner.manager
        .getRepository(Person)
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

      if (!findResult) {
        ret = {
          status: {
            status: 'error',
            message: 'Person not found',
          },
        };

        throw new Error('Person not found');
      }

      let newData: any = { ...findResult, ...data };

      await queryRunner.connection
        .createQueryBuilder()
        .update(Person)
        .set({ ...newData })
        .where('id = :perId', { perId })
        .execute();

      const checkResult = await queryRunner.manager
        .getRepository(Person)
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

      ret = {
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

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Mutation(() => PersonResponse)
  @UseMiddleware(isClerk)
  async updatePersonAndAddress(
    @Arg('person', () => Int) person: number,
    @Arg('data', () => PersonUpdateInput) data: PersonUpdateInput,
    @Arg('address', () => String) address: string,
    @Arg('postalCode', () => String, { nullable: true })
    postalCode: string | undefined,
    @Arg('country', () => Int) country: number
  ): Promise<PersonResponse> {
    let ret: PersonResponse = {
      status: {
        status: 'error',
        message: 'Could not update person',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const findResult = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .select([
          'per.rutNum',
          'per.name',
          'per.division',
          'per.phone',
          'per.email',
        ])
        .where('per.id = :perId', { person })
        .getOne();

      if (!findResult) {
        ret = {
          status: {
            status: 'error',
            message: 'Person not found',
          },
        };

        throw new Error('Person not found');
      }

      let newData: any = { ...findResult, ...data };

      await queryRunner.connection
        .createQueryBuilder()
        .update(Person)
        .set({ ...newData })
        .where('id = :perId', { person })
        .execute();

      const newAddressResult = await queryRunner.manager
        .getRepository(Address)
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
        ret = {
          status: {
            status: 'error',
            message: 'Address could not be updated',
          },
        };

        throw new Error('Address could not be updated');
      }

      const updateResult = await queryRunner.connection
        .createQueryBuilder()
        .update(PersonResidesAddress)
        .set({ endDate: new Date().toISOString() })
        .where('person = :person', { person })
        .andWhere('end_date is null')
        .execute();

      if (updateResult.affected === 0) {
        ret = {
          status: {
            status: 'error',
            message: 'Address could not be updated',
          },
        };

        throw new Error('Address could not be updated');
      }

      const insertResult = await queryRunner.manager
        .getRepository(PersonResidesAddress)
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
        ret = {
          status: {
            status: 'error',
            message: 'Address could not be updated',
          },
        };

        throw new Error('Address could not be updated');
      }

      const result = await queryRunner.manager
        .getRepository(PersonResidesAddress)
        .createQueryBuilder('pra')
        .leftJoinAndSelect('pra.person', 'per')
        .leftJoinAndSelect('pra.address', 'addr')
        .leftJoinAndSelect('addr.country', 'coun')
        .where('pra.person = :id', { id: person })
        .getOne();

      ret = {
        status: {
          status: 'ok',
        },
        person: {
          id: result?.person.id!,
          name: result?.person.name,
          division: result?.person.division,
          phone: result?.person.phone,
          email: result?.person.email,
          rut: `${result?.person.rutNum}-${result?.person.rutDv}`,
          address: result?.address,
        },
      };

      queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }

    return ret;
  }

  @Mutation(() => StatusResponse)
  @UseMiddleware(isClerk)
  async deletePerson(
    @Arg('id', () => Int) id: number
  ): Promise<StatusResponse> {
    let ret: StatusResponse = {
      status: 'error',
      message: 'Could not delete person',
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const checkPerson = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .select('per.id')
        .where('id = :id', { id })
        .getOne();

      if (!checkPerson) {
        ret = {
          status: 'error',
          message: 'Person not found',
        };

        throw new Error('Person not found');
      }

      await queryRunner.connection
        .createQueryBuilder()
        .delete()
        .from(Person)
        .where('id = :id', { id })
        .execute();

      // After deleting a person, if they were the only one who received certain
      // documents, those would be left orphaned (i.e. with no recipients). These
      // documents must be deleted as well. Fortunately, the Postgres server can
      // handle this through a trigger.

      ret = {
        status: 'ok',
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }
}
