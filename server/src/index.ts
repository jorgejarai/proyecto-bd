import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import cors from "cors";
import { UserResolver } from "./resolvers/UserResolver";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from "./entity/User";
import { sendRefreshToken } from "./sendRefreshToken";
import { PersonResolver } from "./resolvers/PersonResolver";
import { DocumentResolver } from "./resolvers/DocumentResolver";
import { AddressResolver } from "./resolvers/AddressResolver";
import { CountryResolver } from "./resolvers/CountryResolver";

(async () => {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.get("/", (_, res) => res.send("You shouldn't be here, but ok"));

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;

    if (!token) {
      return res.send({ status: "error", accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.error(err);

      return res.send({ status: "error", accessToken: "" });
    }

    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ status: "error", accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ status: "error", accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ status: "ok", accessToken: createAccessToken(user) });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        PersonResolver,
        DocumentResolver,
        AddressResolver,
        CountryResolver,
      ],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server listening on port 4000");
  });
})();

// vim: ts=2 sw=2 et
