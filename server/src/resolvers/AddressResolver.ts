import {
  Arg,
  Query,
  Resolver,
  UseMiddleware,
  Int,
  Mutation,
} from 'type-graphql';
import { Address } from '../entity/Address';
import { isAuth } from '../isAuth';
import { isClerk } from '../isClerk';
import { getRepository } from 'typeorm';

@Resolver()
export class AddressResolver {
  @Query(() => Address, { nullable: true })
  @UseMiddleware(isAuth)
  async address(@Arg('id', () => Int) id: number) {
    const result = await getRepository(Address)
      .createQueryBuilder('addr')
      .leftJoinAndSelect('addr.country', 'country')
      .where('addr.id = :id', { id })
      .getOne();

    if (!result) {
      return null;
    }

    return result;
  }

  @Mutation(() => Int, { nullable: true })
  @UseMiddleware(isClerk)
  async addAddress(
    @Arg('address', () => String) address: string,
    @Arg('postalCode', () => String, { nullable: true }) postalCode: string,
    @Arg('country', () => Int) country: number
  ) {
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

    return result.generatedMaps[0].id;
  }
}
