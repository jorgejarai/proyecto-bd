import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class StatusResponse {
  @Field()
  status: 'ok' | 'error';

  @Field({ nullable: true })
  message?: string;
}
