import {
  Arg,
  Field,
  Query,
  Resolver,
  UseMiddleware,
  Int,
  Mutation,
  ObjectType,
} from 'type-graphql';
import { Address } from '../entity/Address';
import { isAuth } from '../isAuth';
import { isClerk } from '../isClerk';
import { getRepository } from 'typeorm';
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
  @Query(() => AddressResponse)
  @UseMiddleware(isAuth)
  async address(@Arg('id', () => Int) id: number): Promise<AddressResponse> {
    const result = await getRepository(Address)
      .createQueryBuilder('addr')
      .leftJoinAndSelect('addr.country', 'country')
      .where('addr.id = :id', { id })
      .getOne();

    if (!result) {
      return {
        status: {
          status: 'error',
          message: 'Address not found',
        },
      };
    }

    return {
      status: {
        status: 'ok',
      },
      address: result,
    };
  }

  @Mutation(() => AddressResponse)
  @UseMiddleware(isClerk)
  async addAddress(
    @Arg('address', () => String) address: string,
    @Arg('postalCode', () => String, { nullable: true })
    postalCode: string | undefined,
    @Arg('country', () => Int) country: number
  ): Promise<AddressResponse> {
    const result = await getRepository(Address)
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
      return {
        status: {
          status: 'error',
          message: 'Could not add address',
        },
      };
    }

    return {
      status: {
        status: 'ok',
      },
      address: result.generatedMaps[0].id,
    };
  }
}
