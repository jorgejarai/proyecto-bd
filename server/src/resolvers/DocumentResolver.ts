import {
  Resolver,
  UseMiddleware,
  Query,
  Field,
  Arg,
  Mutation,
  Int,
  Ctx,
  InputType,
} from "type-graphql";
import { isAuth } from "../isAuth";
import { getRepository } from "typeorm";
import { Document } from "../entity/Document";
import { DocumentType } from "../entity/DocumentType";
import { DocumentPerson } from "../entity/DocumentPerson";
import { ObjectType } from "type-graphql";
import { Person } from "../entity/Person";
import { File } from "../entity/File";
import { isClerk } from "../isClerk";
import { Context } from "../Context";
import { verify } from "jsonwebtoken";
import { PersonOutput } from "./PersonResolver";
import { User } from "../entity/User";

@ObjectType()
class DocumentOutput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  docNumber: string;

  @Field()
  subject: string;

  @Field(() => Date, { nullable: true })
  writtenOn?: Date;

  @Field(() => DocumentType)
  docType: DocumentType;

  @Field(() => User)
  recordedBy: User;
}

@ObjectType()
class DocumentResponse {
  @Field(() => DocumentOutput)
  document: DocumentOutput;

  @Field(() => PersonOutput)
  sender: PersonOutput;

  @Field(() => Date, { nullable: true })
  sentOn?: Date;

  @Field(() => [RecipientResponse])
  recipients: RecipientResponse[];

  @Field(() => [File])
  files: File[];
}

@ObjectType()
class RecipientResponse {
  @Field(() => PersonOutput)
  person: PersonOutput;

  @Field(() => Date)
  receivedOn: Date;
}

@InputType()
class RecipientInput {
  @Field(() => Int)
  person: number;

  @Field(() => Date)
  receivedOn: Date;
}

@Resolver()
export class DocumentResolver {
  @Query(() => [DocumentResponse])
  @UseMiddleware(isAuth)
  async documents(): Promise<DocumentResponse[] | null | undefined> {
    const repeatedDocs = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .select("max(dp.id)", "id")
      .groupBy("document")
      .getRawMany();

    if (repeatedDocs.length === 0) return [];

    let repeatedIds: number[] = [];
    for (let repeatedDoc of repeatedDocs) {
      repeatedIds = [...repeatedIds, repeatedDoc.id];
    }

    const results = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .leftJoinAndSelect("dp.document", "doc")
      .leftJoinAndSelect("doc.docType", "doct")
      .leftJoinAndSelect("doc.sender", "sen")
      .leftJoinAndSelect("doc.files", "files")
      .leftJoinAndSelect("doc.recordedBy", "recor")
      .where("dp.id in (:...ids)", { ids: repeatedIds })
      .getMany();

    let ret: DocumentResponse[] = [];

    for (let result of results) {
      const recipientsResult = await getRepository(DocumentPerson)
        .createQueryBuilder("dp")
        .where("dp.document = :docId", { docId: result.document.id })
        .leftJoinAndSelect("dp.recipient", "recip")
        .getMany();

      let recipients: RecipientResponse[] = [];
      for (let { recipient } of recipientsResult) {
        const { id, rutNum, rutDv, name, division, phone, email } = recipient;
        recipients = [
          ...recipients,
          {
            person: {
              id,
              name,
              division,
              phone,
              email,
              rut: `${rutNum}-${rutDv}`,
            },
            receivedOn: new Date(result.receivedOn),
          },
        ];
      }

      const { document: doc } = result;
      const { id, rutNum, rutDv, name, division, phone, email } = doc.sender;

      ret = [
        ...ret,
        {
          document: doc,
          sender: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
          sentOn: result.document.sentOn,
          recipients: recipients,
          files: doc.files,
        },
      ];
    }
    return ret;
  }

  @Query(() => DocumentResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async document(
    @Arg("id", () => Int) id: number
  ): Promise<DocumentResponse | null | undefined> {
    const repeatedDocs = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .select("max(dp.id)", "id")
      .where("dp.document = :id", { id })
      .groupBy("document")
      .getRawMany();

    if (!repeatedDocs || repeatedDocs.length === 0) return null;

    let repeatedIds: number[] = [];
    for (let repeatedDoc of repeatedDocs) {
      repeatedIds = [...repeatedIds, repeatedDoc.id];
    }

    const result = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .leftJoinAndSelect("dp.document", "doc")
      .leftJoinAndSelect("doc.docType", "doct")
      .leftJoinAndSelect("doc.sender", "sen")
      .leftJoinAndSelect("doc.files", "files")
      .leftJoinAndSelect("doc.recordedBy", "rec")
      .where("dp.id in (:...ids)", { ids: repeatedIds })
      .andWhere("dp.document = :id", { id })
      .getOne();

    if (!result) return null;

    const recipientsResult = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .where("dp.document = :docId", { docId: result.document.id })
      .leftJoinAndSelect("dp.recipient", "recip")
      .getMany();

    let recipients: RecipientResponse[] = [];
    for (let { recipient } of recipientsResult) {
      const { id, rutNum, rutDv, name, division, phone, email } = recipient;
      recipients = [
        ...recipients,
        {
          person: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
          receivedOn: new Date(result.receivedOn),
        },
      ];
    }

    const { document: doc } = result;
    const {
      id: senderId,
      rutNum,
      rutDv,
      name,
      division,
      phone,
      email,
    } = doc.sender;

    return {
      document: doc,
      sender: {
        id: senderId,
        name,
        division,
        phone,
        email,
        rut: `${rutNum}-${rutDv}`,
      },
      sentOn: result.document.sentOn,
      recipients: recipients,
      files: doc.files,
    };
  }

  @Mutation(() => DocumentResponse, { nullable: true })
  @UseMiddleware(isClerk)
  async addDocument(
    @Arg("docNumber", { nullable: true }) docNumber: string,
    @Arg("subject") subject: string,
    @Arg("writtenOn", { nullable: true }) writtenOn: string,
    @Arg("docType", () => Int) docType: number,
    @Arg("sender", () => Int) sender: number,
    @Arg("sentOn", { nullable: true }) sentOn: string,
    @Arg("recipients", () => [RecipientInput]) recipients: RecipientInput[],
    @Ctx() context: Context
  ): Promise<DocumentResponse | null | undefined> {
    const token = context.req.headers["authorization"]!.split(" ")[1];
    const { userId }: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    const insertResult = await getRepository(Document)
      .createQueryBuilder("doc")
      .insert()
      .values({
        docNumber,
        subject,
        writtenOn,
        docType: { id: docType },
        recordedBy: userId,
        sender: { id: sender },
        sentOn,
      })
      .returning(["id"])
      .execute();

    const checkResult = await getRepository(Document)
      .createQueryBuilder("doc")
      .leftJoinAndSelect("doc.docType", "doct")
      .leftJoinAndSelect("doc.sender", "sen")
      .leftJoinAndSelect("doc.files", "files")
      .leftJoinAndSelect("doc.recordedBy", "rec")
      .where("doc.id = :id", { id: insertResult.generatedMaps[0].id })
      .getOne();

    console.log(checkResult);

    if (!checkResult || recipients.length === 0) {
      return null;
    }

    let recipientIds: number[] = [];
    recipients.forEach((recipient) => {
      recipientIds = [...recipientIds, recipient.person];
    });

    const checkSender = await getRepository(Person)
      .createQueryBuilder("per")
      .where("per.id = :id", { id: sender })
      .getOne();

    console.log(sender, checkSender);

    if (!checkSender) {
      return null;
    }

    const checkRecipients = await getRepository(Person)
      .createQueryBuilder("per")
      .where("per.id in (:...recipientIds)", { recipientIds })
      .getMany();
    console.log(checkRecipients);

    if (checkRecipients.length !== recipients.length) {
      return null;
    }

    for (let { person, receivedOn } of recipients) {
      await getRepository(DocumentPerson)
        .createQueryBuilder("dp")
        .insert()
        .values({
          recipient: { id: person },
          receivedOn: receivedOn.toISOString(),
          document: { id: checkResult.id },
        })
        .execute();
    }

    const { id, rutNum, rutDv, name, division, phone, email } = checkSender;

    return {
      document: checkResult,
      sender: {
        id,
        name,
        division,
        phone,
        email,
        rut: `${rutNum}-${rutDv}`,
      },
      sentOn: insertResult.generatedMaps[0].sentOn,
      recipients: checkRecipients.map((recipient) => {
        const { id, rutNum, rutDv, name, division, phone, email } = checkSender;
        return {
          person: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
          receivedOn: recipients.find(({ person: id }) => id === recipient.id)![
            "receivedOn"
          ]!,
        };
      }),
      files: [],
    };
  }

  @Query(() => [DocumentType])
  @UseMiddleware(isAuth)
  documentTypes() {
    return DocumentType.find();
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isClerk)
  async addRecipient(
    @Arg("document", () => Int) documentId: number,
    @Arg("recipient", () => Int) recipientId: number,
    @Arg("receivedOn") receivedOn: string
  ) {
    const docExists = await getRepository(Document)
      .createQueryBuilder("doc")
      .select("id")
      .where("doc.id = :id", { id: documentId })
      .getCount();

    if (docExists === 0) {
      return false;
    }

    const recipientExists = await getRepository(Person)
      .createQueryBuilder("per")
      .select("id")
      .where("per.id = :id", { id: recipientId })
      .getCount();

    if (recipientExists === 0) {
      return false;
    }

    await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .insert()
      .values({
        receivedOn,
        recipient: { id: recipientId },
        document: { id: documentId },
      })
      .execute();

    return true;
  }

  @Query(() => [RecipientResponse], { nullable: true })
  @UseMiddleware(isAuth)
  async getRecipients(@Arg("id", () => Int) id: number) {
    const docExists = await getRepository(Document)
      .createQueryBuilder("doc")
      .select("id")
      .where("doc.id = :id", { id })
      .getCount();

    if (docExists === 0) {
      return null;
    }

    const recipients = await getRepository(DocumentPerson)
      .createQueryBuilder("dp")
      .leftJoinAndSelect("dp.recipient", "recp")
      .addSelect("dp.receivedOn")
      .where("dp.document = :id", { id })
      .getMany();

    let result: RecipientResponse[] = [];
    recipients.forEach(({ recipient, receivedOn }) => {
      const { id, rutNum, rutDv, name, division, phone, email } = recipient;
      result = [
        ...result,
        {
          receivedOn: new Date(receivedOn),
          person: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
        },
      ];
    });

    return result;
  }
}
