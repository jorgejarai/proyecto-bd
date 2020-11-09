import {
  Resolver,
  UseMiddleware,
  Query,
  Field,
  Arg,
  Mutation,
  Int,
  Ctx,
} from 'type-graphql';
import { isAuth } from '../isAuth';
import { getRepository } from 'typeorm';
import { Document } from '../entity/Document';
import { DocumentType } from '../entity/DocumentType';
import { DocumentPerson } from '../entity/DocumentPerson';
import { ObjectType } from 'type-graphql';
import { Person } from '../entity/Person';
import { File } from '../entity/File';
import { isClerk } from '../isClerk';
import { Context } from '../Context';
import { verify } from 'jsonwebtoken';

@ObjectType()
class DocumentResponse {
  @Field(() => Document)
  document: Document;

  @Field(() => Person)
  sender: Person;

  @Field(() => [Recipient])
  recipients: Recipient[];

  @Field(() => [File])
  files: File[];
}

@ObjectType()
class Recipient {
  @Field(() => Person)
  person: Person;

  @Field(() => String)
  receivedOn: string;
}

@Resolver()
export class DocumentResolver {
  @Query(() => [DocumentResponse])
  @UseMiddleware(isAuth)
  async documents() {
    const repeatedDocs = await getRepository(DocumentPerson)
      .createQueryBuilder('dp')
      .select('max(dp.id)', 'id')
      .groupBy('document')
      .getRawMany();

    let repeatedIds: number[] = [];
    for (let repeatedDoc of repeatedDocs) {
      repeatedIds = [...repeatedIds, repeatedDoc.id];
    }

    const results = await getRepository(DocumentPerson)
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.document', 'doc')
      .leftJoinAndSelect('doc.docType', 'doct')
      .leftJoinAndSelect('doc.sender', 'sen')
      .leftJoinAndSelect('doc.files', 'files')
      .leftJoinAndSelect('doc.recordedBy', 'recor')
      .where('dp.id in (:...ids)', { ids: repeatedIds })
      .getMany();

    let ret: DocumentResponse[] = [];

    for (let result of results) {
      const recipientsResult = await getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .where('dp.document = :docId', { docId: result.document.id })
        .leftJoinAndSelect('dp.recipient', 'recip')
        .getMany();

      let recipients: Recipient[] = [];
      for (let { recipient } of recipientsResult) {
        recipients = [
          ...recipients,
          {
            person: recipient,
            receivedOn: result.receivedOn,
          },
        ];
      }

      const { document } = result;

      ret = [
        ...ret,
        {
          document,
          sender: document.sender,
          recipients: recipients,
          files: document.files,
        },
      ];
    }
    return ret;
  }

  @Query(() => DocumentResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async document(@Arg('id') id: number) {
    const repeatedDocs = await getRepository(DocumentPerson)
      .createQueryBuilder('dp')
      .select('max(dp.id)', 'id')
      .where('dp.document = :id', { id })
      .groupBy('document')
      .getRawMany();

    if (!repeatedDocs || repeatedDocs.length === 0) return null;

    let repeatedIds: number[] = [];
    for (let repeatedDoc of repeatedDocs) {
      repeatedIds = [...repeatedIds, repeatedDoc.id];
    }

    const result = await getRepository(DocumentPerson)
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.document', 'doc')
      .leftJoinAndSelect('doc.docType', 'doct')
      .leftJoinAndSelect('doc.sender', 'sen')
      .leftJoinAndSelect('doc.files', 'files')
      .leftJoinAndSelect('doc.recordedBy', 'rec')
      .where('dp.id in (:...ids)', { ids: repeatedIds })
      .andWhere('dp.document = :id', { id })
      .getOne();

    if (!result) return null;

    const recipientsResult = await getRepository(DocumentPerson)
      .createQueryBuilder('dp')
      .where('dp.document = :docId', { docId: result.document.id })
      .leftJoinAndSelect('dp.recipient', 'recip')
      .getMany();

    let recipients: Recipient[] = [];
    for (let { recipient } of recipientsResult) {
      recipients = [
        ...recipients,
        {
          person: recipient,
          receivedOn: result.receivedOn,
        },
      ];
    }

    const { document } = result;

    return {
      document,
      sender: document.sender,
      recipients: recipients,
      files: document.files,
    };
  }

  @Mutation(() => Document, { nullable: true })
  @UseMiddleware(isClerk)
  async addDocument(
    @Arg('docNumber', { nullable: true }) docNumber: string,
    @Arg('subject') subject: string,
    @Arg('writtenOn', { nullable: true }) writtenOn: string,
    @Arg('docType', () => Int) docType: number,
    @Arg('sender', () => Int) sender: number,
    @Arg('sentOn', { nullable: true }) sentOn: string,
    @Ctx() context: Context
  ) {
    const token = context.req.headers['authorization']!.split(' ')[1];
    const { userId }: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

    const insertResult = await getRepository(Document)
      .createQueryBuilder('doc')
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
      .returning([
        'id',
        // 'docNumber',
        // 'subject',
        // 'writtenOn',
        // 'docType',
        // 'recordedBy',
        // 'sender',
        // 'sentOn',
        // 'files',
      ])
      .execute();

    const checkResult = await getRepository(Document)
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.docType', 'doct')
      .leftJoinAndSelect('doc.sender', 'sen')
      .leftJoinAndSelect('doc.files', 'files')
      .leftJoinAndSelect('doc.recordedBy', 'rec')
      .where('doc.id = :id', { id: insertResult.generatedMaps[0].id })
      .getOne();

    return checkResult;
  }

  @Query(() => [DocumentType])
  @UseMiddleware(isAuth)
  documentTypes() {
    return DocumentType.find();
  }
}
