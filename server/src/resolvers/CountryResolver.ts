import { Arg, Query, Resolver, UseMiddleware, Int } from "type-graphql";
import { isAuth } from "../isAuth";
import { Country } from "../entity/Country";

@Resolver()
export class CountryResolver {
  @Query(() => [Country])
  @UseMiddleware(isAuth)
  async countries() {
    return Country.find();
  }

  @Query(() => Country, { nullable: true })
  @UseMiddleware(isAuth)
  async country(@Arg("countryNumber", () => Int) countryNumber: number) {
    return Country.findOne({ countryNumber });
  }
}
