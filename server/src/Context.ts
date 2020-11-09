import { Request, Response } from "express";

export interface Context {
  req: Request;
  res: Response;
  payload?: { userId: string };
}
//
// vim: ts=2 sw=2 et
