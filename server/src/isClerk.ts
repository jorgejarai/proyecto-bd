import { MiddlewareFn } from 'type-graphql';
import { verify } from 'jsonwebtoken';
import { Context } from './Context';
import { AuthenticationError } from 'apollo-server-express';

export const isClerk: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new AuthenticationError('Not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    if (!payload.isClerk) throw new AuthenticationError('Not authorized');

    context.payload = payload;
  } catch (err) {
    console.log(err);
    throw err;
  }

  return next();
};

// vim: ts=2 sw=2 et
