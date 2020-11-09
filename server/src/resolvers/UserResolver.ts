import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { User } from '../entity/User';
import { Context } from '../Context';
import { createRefreshToken, createAccessToken } from '../auth';
import { isAuth } from '../isAuth';
import { sendRefreshToken } from '../sendRefreshToken';
import { userRegistrationSchema, userLoginSchema } from '../schema';

@ObjectType()
class LoginResponse {
  @Field()
  status: string;
  @Field(() => String, { nullable: true })
  accessToken?: string;
  @Field(() => User, { nullable: true })
  user?: User;
  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
class RegisterResponse {
  @Field()
  status: string;
  @Field({ nullable: true })
  message?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!';
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: Context) {
    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() context: Context) {
    const authorization = context.req.headers['authorization'];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

      return User.findOne(payload.userId);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // no usar en producción
  @Mutation(() => Boolean)
  async revokeRefreshTokens(@Arg('userId', () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);

    return true;
  }

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
    userLoginSchema.validate({ email, password }).catch(() => {
      return {
        status: 'error',
      };
    });

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        status: 'error',
        message: 'Invalid user or password',
      };
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      return {
        status: 'error',
        message: 'Invalid user or password',
      };
    }

    sendRefreshToken(res, createRefreshToken(user));

    return {
      status: 'ok',
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Arg('email') email: string,
    @Arg('name') name: string,
    @Arg('password') password: string
  ): Promise<RegisterResponse> {
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

// vim: ts=2 sw=2 et
