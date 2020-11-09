import { sign } from 'jsonwebtoken';
import { User } from './entity/User';

export const createAccessToken = (user: User) => {
  return sign(
    { userId: user.id, isClerk: user.isClerk },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: '24h',
    }
  );
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, isClerk: user.isClerk, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    }
  );
};

// vim: ts=2 sw=2 et
