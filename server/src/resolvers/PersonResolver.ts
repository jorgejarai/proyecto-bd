import {
  Resolver,
  UseMiddleware,
  Query,
  Arg,
  Int,
  Mutation,
  Field,
  ObjectType,
} from "type-graphql";
import { Person } from "../entity/Person";
import { Address } from "../entity/Address";
import { isAuth } from "../isAuth";
import { getRepository } from "typeorm";
import { PersonResidesAddress } from "../entity/PersonResidesAddress";
import { isClerk } from "../isClerk";
import { personSchema } from "../schema";

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

  @Field(() => Int, { nullable: true })
  phone?: number;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
class PersonResponse {
  @Field(() => PersonOutput, { nullable: true })
  person?: PersonOutput;

  @Field(() => String)
  status: String;

  @Field(() => Address, { nullable: true })
  address?: Address;
}

@Resolver()
export class PersonResolver {
  @Query(() => [PersonResponse])
  @UseMiddleware(isAuth)
  async persons() {
    const results = await getRepository(PersonResidesAddress)
      .createQueryBuilder("pra")
      .leftJoinAndSelect("pra.person", "person")
      .leftJoinAndSelect("pra.address", "address")
      .leftJoinAndSelect("address.country", "country")
      .where("end_date is null")
      .getMany();

    let ret: PersonResponse[] = [];

    for (let { person, address } of results) {
      const { id, rutNum, rutDv, name, division, phone, email } = person;
      ret = [
        ...ret,
        {
          status: "ok",
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
  async person(@Arg("id", () => Int) id: number) {
    const result = await getRepository(PersonResidesAddress)
      .createQueryBuilder("pra")
      .leftJoinAndSelect("pra.person", "person")
      .leftJoinAndSelect("pra.address", "address")
      .leftJoinAndSelect("address.country", "country")
      .where("end_date is null")
      .andWhere("person.id = :id", { id })
      .getOne();

    if (!result) {
      return {
        status: "error",
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
    @Arg("id", () => Int) id: number,
    @Arg("date", () => Date, { nullable: true }) date?: Date
  ) {
    if (!date) {
      const result = await getRepository(PersonResidesAddress)
        .createQueryBuilder("pra")
        .leftJoinAndSelect("pra.person", "person")
        .leftJoinAndSelect("pra.address", "address")
        .leftJoinAndSelect("address.country", "country")
        .where("end_date is null")
        .andWhere("person.id = :id", { id })
        .getOne();

      if (!result) {
        return null;
      }

      return result.address;
    }

    let results = await getRepository(PersonResidesAddress)
      .createQueryBuilder("pra")
      .leftJoinAndSelect("pra.address", "address")
      .leftJoinAndSelect("address.country", "country")
      .andWhere("pra.person = :id", { id })
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
    @Arg("ids", () => [Int]) ids: number[],
    @Arg("date", () => Date, { nullable: true }) date?: Date
  ) {
    let ret: PersonResponse[] = [];

    for (let id of ids) {
      let result: PersonResidesAddress | undefined;

      if (!date) {
        result = await getRepository(PersonResidesAddress)
          .createQueryBuilder("pra")
          .leftJoinAndSelect("pra.person", "person")
          .leftJoinAndSelect("pra.address", "address")
          .leftJoinAndSelect("address.country", "country")
          .where("end_date is null")
          .andWhere("person.id = :id", { id })
          .getOne();

        if (!result) {
          ret = [
            ...ret,
            {
              status: "error",
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
              status: "ok",
              address: result.address,
            },
          ];
        }
      } else {
        // FIXME: Funciona así como está, pero eventualmente podría simplificarse para obtener la dirección en la fecha pedida directamente en la petición SQL
        const results = await getRepository(PersonResidesAddress)
          .createQueryBuilder("pra")
          .leftJoinAndSelect("pra.person", "person")
          .leftJoinAndSelect("pra.address", "address")
          .leftJoinAndSelect("address.country", "country")
          .andWhere("pra.person = :id", { id })
          .getMany();

        if (!results || results.length === 0) {
          ret = [
            ...ret,
            {
              person: { id },
              status: "error",
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
                  status: "ok",
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
                  status: "ok",
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
                status: "error",
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
    @Arg("rut", () => Int, { nullable: true }) rut: number,
    @Arg("name") name: string,
    @Arg("division", { nullable: true }) division: string,
    @Arg("address", () => Int, { nullable: true }) address: number,
    @Arg("email", { nullable: true }) email: string,
    @Arg("phone", () => Int, { nullable: true }) phone: number
  ): Promise<PersonResponse | null | undefined> {
    const person = { rut, name, division, email, phone };

    personSchema.validate(person).catch(() => {
      return {
        status: "error",
      };
    });

    const newPerson = await getRepository(Person)
      .createQueryBuilder("person")
      .insert()
      .values({
        rutNum: rut,
        name,
        division,
        email,
        phone,
      })
      .returning("*")
      .execute();

    let addressEntry;

    if (address) {
      await getRepository(PersonResidesAddress)
        .createQueryBuilder("pra")
        .insert()
        .values({
          startDate: new Date().toDateString(),
          person: newPerson.generatedMaps[0].id,
          address: { id: address },
        })
        .execute();

      addressEntry = await getRepository(Address)
        .createQueryBuilder("addr")
        .leftJoinAndSelect("addr.country", "country")
        .where("id = :id", { id: address })
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
      status: "ok",
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
}
