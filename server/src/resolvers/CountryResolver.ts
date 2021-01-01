import {
  Field,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { isAuth } from '../isAuth';
import { Country } from '../entity/Country';
import { StatusResponse } from '../StatusResponse';

@ObjectType()
class CountriesResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [Country])
  countries: Country[];
}

@Resolver()
export class CountryResolver {
  @Query(() => CountriesResponse)
  @UseMiddleware(isAuth)
  async countries(): Promise<CountriesResponse> {
    try {
      let countries = await Country.find();

      return {
        status: {
          status: 'ok',
        },
        countries,
      };
    } catch (e) {
      console.log(e);

      return {
        status: {
          status: 'error',
          message: 'Could not get countries',
        },
        countries: [],
      };
    }
  }
}
