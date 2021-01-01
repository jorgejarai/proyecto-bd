import {
  Arg,
  Field,
  Resolver,
  UseMiddleware,
  Int,
  Mutation,
  ObjectType,
} from 'type-graphql';
import { Address } from '../entity/Address';
import { isClerk } from '../isClerk';
import { getConnection } from 'typeorm';
import { StatusResponse } from '../StatusResponse';

// TODO: Al asignar una dirección a una persona, asegurarse de que esta no esté residiendo en una dirección ya existente para el intervalo de fechas dado (incluyendo su dirección actual si la dirección nueva tiene end_date como null)

@ObjectType()
class AddressResponse {
  @Field()
  status: StatusResponse;

  @Field({ nullable: true })
  address?: Address;
}

@Resolver()
export class AddressResolver {
  // @Query(() => AddressResponse)
  // @UseMiddleware(isAuth)
  // async address(@Arg('id', () => Int) id: number): Promise<AddressResponse> {
  //   try {
  //   const result = await getRepository(Address)
  //     .createQueryBuilder('addr')
  //     .leftJoinAndSelect('addr.country', 'country')
  //     .where('addr.id = :id', { id })
  //     .getOne();
  //
  //   if (!result) {
  //     return {
  //       status: {
  //         status: 'error',
  //         message: 'Address not found',
  //       },
  //     };
  //   }
  //
  //   return {
  //     status: {
  //       status: 'ok',
  //     },
  //     address: result,
  //   };
  // }

  @Mutation(() => AddressResponse)
  @UseMiddleware(isClerk)
  async addAddress(
    @Arg('address', () => String) address: string,
    @Arg('postalCode', () => String, { nullable: true })
    postalCode: string | undefined,
    @Arg('country', () => Int) country: number
  ): Promise<AddressResponse> {
    let ret: AddressResponse = {
      status: { status: 'error', message: 'Could not add address' },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager
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

      if (!result.generatedMaps[0].id) {
        throw Error('Could not add address');
      }

      const newAddress = await queryRunner.manager
        .getRepository(Address)
        .createQueryBuilder('addr')
        .leftJoinAndSelect('addr.country', 'country')
        .where('addr.id = :id', { id: result.generatedMaps[0].id })
        .getOne();

      ret = {
        status: {
          status: 'ok',
        },
        address: newAddress,
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
}
