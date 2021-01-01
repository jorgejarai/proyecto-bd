import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { User } from '../entity/User';
import { Context } from '../Context';
import { createRefreshToken, createAccessToken } from '../auth';
import { isAuth } from '../isAuth';
import { sendRefreshToken } from '../sendRefreshToken';
import { userRegistrationSchema, userLoginSchema } from '../schema';
import { StatusResponse } from '../StatusResponse';

@ObjectType()
class LoginResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class UserResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class UsersResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [User])
  users: User[];
}

@Resolver()
export class UserResolver {
  @Query(() => UsersResponse)
  @UseMiddleware(isAuth)
  async users(): Promise<UsersResponse> {
    let ret: UsersResponse = {
      status: {
        status: 'error',
        message: 'Could not get users',
      },
      users: [],
    };

    try {
      const users = await User.find();

      ret = {
        status: {
          status: 'ok',
        },
        users,
      };
    } catch (e) {
      console.log(e);
    }

    return ret;
  }

  @Query(() => UserResponse)
  async me(@Ctx() context: Context): Promise<UserResponse> {
    const ret: UserResponse = {
      status: {
        status: 'error',
        message: 'Could not get user info',
      },
    };

    const authorization = context.req.headers['authorization'];

    if (!authorization) {
      return ret;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

      return {
        status: {
          status: 'ok',
        },
        user: await User.findOne(payload.userId),
      };
    } catch (e) {
      console.log(e);
      return ret;
    }
  }

  // no usar en producción
  // @Mutation(() => Boolean)
  // async revokeRefreshTokens(@Arg('userId', () => Int) userId: number) {
  //   await getConnection()
  //     .getRepository(User)
  //     .increment({ id: userId }, 'tokenVersion', 1);
  //
  //   return true;
  // }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: Context) {
    sendRefreshToken(res, '');

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    try {
      userLoginSchema.validate({ email, password }).catch(() => {
        return {
          status: {
            status: 'error',
            message: 'Invalid format',
          },
        };
      });

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return {
          status: {
            status: 'error',
            message: 'Invalid user or password',
          },
        };
      }

      const validPassword = await compare(password, user.password);

      if (!validPassword) {
        return {
          status: {
            status: 'error',
            message: 'Invalid user or password',
          },
        };
      }

      sendRefreshToken(res, createRefreshToken(user));

      return {
        status: {
          status: 'ok',
        },
        accessToken: createAccessToken(user),
        user,
      };
    } catch (e) {
      console.log(e);

      return {
        status: {
          status: 'error',
          message: 'Could not log in',
        },
      };
    }
  }

  @Mutation(() => StatusResponse)
  async register(
    @Arg('email') email: string,
    @Arg('name') name: string,
    @Arg('password') password: string
  ): Promise<StatusResponse> {
    userRegistrationSchema
      .validate({
        email,
        name,
        password,
      })
      .catch(() => {
        return {
          status: 'error',
        };
      });

    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({ email, name, password: hashedPassword });
    } catch (err) {
      if (err.detail.includes('already exists')) {
        return {
          status: 'error',
          message: 'User already exists',
        };
      } else {
        return {
          status: 'error',
          message: 'Database error',
        };
      }
    }

    return {
      status: 'ok',
    };
  }
}
