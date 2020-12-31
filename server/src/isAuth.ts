import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { Context } from './Context';
import { AuthenticationError } from 'apollo-server-express';

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new AuthenticationError('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new AuthenticationError('Not authenticated');
  }

  return next();
};

// vim: ts=2 sw=2 et
