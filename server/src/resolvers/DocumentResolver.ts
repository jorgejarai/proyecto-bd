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
} from 'type-graphql';
import { isAuth } from '../isAuth';
import { getConnection } from 'typeorm';
import { Document } from '../entity/Document';
import { DocumentType } from '../entity/DocumentType';
import { DocumentPerson } from '../entity/DocumentPerson';
import { ObjectType } from 'type-graphql';
import { Person } from '../entity/Person';
import { File } from '../entity/File';
import { isClerk } from '../isClerk';
import { Context } from '../Context';
import { verify } from 'jsonwebtoken';
import { PersonOutput } from './PersonResolver';
import { User } from '../entity/User';
import { StatusResponse } from '../StatusResponse';

@ObjectType()
class DocumentOutput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  docNumber: string;

  @Field()
  subject: string;

  @Field(() => String, { nullable: true })
  writtenOn?: string;

  @Field(() => DocumentType)
  docType: DocumentType;

  @Field(() => User)
  recordedBy: User;

  @Field(() => PersonOutput, { nullable: true })
  sender?: PersonOutput;

  @Field(() => String, { nullable: true })
  sentOn?: string;

  @Field(() => [RecipientResponse], { nullable: true })
  recipients?: RecipientResponse[];

  @Field(() => [File], { nullable: true })
  files?: File[];
}

@ObjectType()
class DocumentResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => DocumentOutput, { nullable: true })
  document?: DocumentOutput;
}

@ObjectType()
class DocumentsResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [DocumentOutput])
  documents: DocumentOutput[];
}

@ObjectType()
class DocumentTypesResponse {
  @Field(() => StatusResponse)
  status: StatusResponse;

  @Field(() => [DocumentType])
  docTypes: DocumentType[];
}

@ObjectType()
class RecipientResponse {
  @Field(() => PersonOutput)
  person: PersonOutput;

  @Field(() => String)
  receivedOn: string;
}

@InputType()
class RecipientInput {
  @Field(() => Int)
  person: number;

  @Field(() => String)
  receivedOn: string;
}

@InputType()
class DocumentUpdateInput {
  @Field({ nullable: true })
  docNumber: string;

  @Field({ nullable: true })
  subject: string;

  @Field(() => String, { nullable: true })
  writtenOn?: string;

  @Field(() => Int, { nullable: true })
  docType: number;

  @Field(() => String, { nullable: true })
  sentOn?: string;
}

@Resolver()
export class DocumentResolver {
  @Query(() => DocumentsResponse)
  @UseMiddleware(isAuth)
  async documents(): Promise<DocumentsResponse> {
    let ret: DocumentsResponse = {
      status: {
        status: 'error',
        message: 'Could not get documents',
      },
      documents: [],
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const repeatedDocs = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .select('max(dp.id)', 'id')
        .groupBy('document')
        .getRawMany();

      if (repeatedDocs.length === 0) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        return {
          status: { status: 'ok' },
          documents: [],
        };
      }

      let repeatedIds: number[] = [];
      for (let repeatedDoc of repeatedDocs) {
        repeatedIds = [...repeatedIds, repeatedDoc.id];
      }

      const results = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .leftJoinAndSelect('dp.document', 'doc')
        .leftJoinAndSelect('doc.docType', 'doct')
        .leftJoinAndSelect('doc.sender', 'sen')
        .leftJoinAndSelect('doc.files', 'files')
        .leftJoinAndSelect('doc.recordedBy', 'recor')
        .where('dp.id in (:...ids)', { ids: repeatedIds })
        .getMany();

      for (let result of results) {
        const recipientsResult = await queryRunner.manager
          .getRepository(DocumentPerson)
          .createQueryBuilder('dp')
          .where('dp.document = :docId', { docId: result.document.id })
          .leftJoinAndSelect('dp.recipient', 'recip')
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
              receivedOn: result.receivedOn,
            },
          ];
        }

        const { document: doc } = result;
        const { id, rutNum, rutDv, name, division, phone, email } = doc.sender;

        ret.documents = [
          ...ret.documents,
          {
            ...doc,
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

      ret.status = {
        status: 'ok',
      };
      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Query(() => DocumentResponse)
  @UseMiddleware(isAuth)
  async document(@Arg('id', () => Int) id: number): Promise<DocumentResponse> {
    let ret: DocumentResponse = {
      status: {
        status: 'error',
        message: 'Could not get document',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const repeatedDocs = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .select('max(dp.id)', 'id')
        .where('dp.document = :id', { id })
        .groupBy('document')
        .getRawMany();

      if (!repeatedDocs || repeatedDocs.length === 0) {
        ret = {
          status: {
            status: 'error',
            message: 'Document not found',
          },
        };

        throw new Error('Document not found');
      }

      let repeatedIds: number[] = [];
      for (let repeatedDoc of repeatedDocs) {
        repeatedIds = [...repeatedIds, repeatedDoc.id];
      }

      const result = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .leftJoinAndSelect('dp.document', 'doc')
        .leftJoinAndSelect('doc.docType', 'doct')
        .leftJoinAndSelect('doc.sender', 'sen')
        .leftJoinAndSelect('doc.files', 'files')
        .leftJoinAndSelect('doc.recordedBy', 'rec')
        .where('dp.id in (:...ids)', { ids: repeatedIds })
        .andWhere('dp.document = :id', { id })
        .getOne();

      if (!result) {
        ret = {
          status: {
            status: 'error',
            message: 'Invalid document',
          },
        };

        throw new Error('Invalid document');
      }

      const recipientsResult = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .where('dp.document = :docId', { docId: result.document.id })
        .leftJoinAndSelect('dp.recipient', 'recip')
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
            receivedOn: result.receivedOn,
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

      ret = {
        status: {
          status: 'ok',
        },
        document: {
          ...doc,
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
        },
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Mutation(() => DocumentResponse)
  @UseMiddleware(isClerk)
  async addDocument(
    @Arg('docNumber', { nullable: true }) docNumber: string,
    @Arg('subject') subject: string,
    @Arg('writtenOn', { nullable: true }) writtenOn: string,
    @Arg('docType', () => Int) docType: number,
    @Arg('sender', () => Int) sender: number,
    @Arg('sentOn', { nullable: true }) sentOn: string,
    @Arg('recipients', () => [RecipientInput]) recipients: RecipientInput[],
    @Ctx() context: Context
  ): Promise<DocumentResponse> {
    let ret: DocumentResponse = {
      status: {
        status: 'error',
        message: 'Could not add document',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const token = context.req.headers['authorization']!.split(' ')[1];
      const { userId }: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

      const insertResult = await queryRunner.manager
        .getRepository(Document)
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
        .returning(['id'])
        .execute();

      const checkResult = await queryRunner.manager
        .getRepository(Document)
        .createQueryBuilder('doc')
        .leftJoinAndSelect('doc.docType', 'doct')
        .leftJoinAndSelect('doc.sender', 'sen')
        .leftJoinAndSelect('doc.files', 'files')
        .leftJoinAndSelect('doc.recordedBy', 'rec')
        .where('doc.id = :id', { id: insertResult.generatedMaps[0].id })
        .getOne();

      if (!checkResult || recipients.length === 0) {
        ret = {
          status: {
            status: 'error',
            message: 'Could not add document',
          },
        };

        throw new Error('Could not add document');
      }

      let recipientIds: number[] = [];
      recipients.forEach((recipient) => {
        recipientIds = [...recipientIds, recipient.person];
      });

      const senderData = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .where('per.id = :id', { id: sender })
        .getOne();

      if (!senderData) {
        ret = {
          status: {
            status: 'error',
            message: 'Could not add document',
          },
        };

        throw new Error('Could not add document');
      }

      const uniqueRecipients = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .where('per.id in (:...recipientIds)', { recipientIds })
        .getMany();

      if (uniqueRecipients.length !== recipients.length) {
        ret = {
          status: {
            status: 'error',
            message: 'Could not add document',
          },
        };

        throw new Error('Could not add document');
      }

      for (let { person, receivedOn } of recipients) {
        await queryRunner.manager
          .getRepository(DocumentPerson)
          .createQueryBuilder('dp')
          .insert()
          .values({
            recipient: { id: person },
            receivedOn: receivedOn,
            document: { id: checkResult.id },
          })
          .execute();
      }

      const { id, rutNum, rutDv, name, division, phone, email } = senderData;

      ret = {
        status: {
          status: 'ok',
        },
        document: {
          ...checkResult,
          sender: {
            id,
            name,
            division,
            phone,
            email,
            rut: `${rutNum}-${rutDv}`,
          },
          sentOn: insertResult.generatedMaps[0].sentOn
            ?.toISOString()
            .substring(0, 10),
          recipients: uniqueRecipients.map((recipient) => {
            const {
              id,
              rutNum,
              rutDv,
              name,
              division,
              phone,
              email,
            } = senderData;
            return {
              person: {
                id,
                name,
                division,
                phone,
                email,
                rut: `${rutNum}-${rutDv}`,
              },
              receivedOn: recipients.find(
                ({ person: id }) => id === recipient.id
              )!['receivedOn']!,
            };
          }),
          files: [],
        },
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Query(() => DocumentTypesResponse)
  @UseMiddleware(isAuth)
  async documentTypes(): Promise<DocumentTypesResponse> {
    try {
      let docTypes: DocumentType[] = await DocumentType.find();

      return {
        status: {
          status: 'ok',
        },
        docTypes,
      };
    } catch (e) {
      console.log(e);

      return {
        status: {
          status: 'error',
          message: 'Could not get document types',
        },
        docTypes: [],
      };
    }
  }

  // @Mutation(() => Boolean)
  // @UseMiddleware(isClerk)
  // async addRecipient(
  //   @Arg('document', () => Int) documentId: number,
  //   @Arg('recipient', () => Int) recipientId: number,
  //   @Arg('receivedOn') receivedOn: string
  // ) {
  //   const docExists = await getRepository(Document)
  //     .createQueryBuilder('doc')
  //     .select('id')
  //     .where('doc.id = :id', { id: documentId })
  //     .getCount();
  //
  //   if (docExists === 0) {
  //     return false;
  //   }
  //
  //   const recipientExists = await getRepository(Person)
  //     .createQueryBuilder('per')
  //     .select('id')
  //     .where('per.id = :id', { id: recipientId })
  //     .getCount();
  //
  //   if (recipientExists === 0) {
  //     return false;
  //   }
  //
  //   await getRepository(DocumentPerson)
  //     .createQueryBuilder('dp')
  //     .insert()
  //     .values({
  //       receivedOn,
  //       recipient: { id: recipientId },
  //       document: { id: documentId },
  //     })
  //     .execute();
  //
  //   return true;
  // }

  // @Query(() => [RecipientResponse], { nullable: true })
  // @UseMiddleware(isAuth)
  // async getRecipients(@Arg('id', () => Int) id: number) {
  //   const docExists = await getRepository(Document)
  //     .createQueryBuilder('doc')
  //     .select('id')
  //     .where('doc.id = :id', { id })
  //     .getCount();
  //
  //   if (docExists === 0) {
  //     return null;
  //   }
  //
  //   const recipients = await getRepository(DocumentPerson)
  //     .createQueryBuilder('dp')
  //     .leftJoinAndSelect('dp.recipient', 'recp')
  //     .addSelect('dp.receivedOn')
  //     .where('dp.document = :id', { id })
  //     .getMany();
  //
  //   let result: RecipientResponse[] = [];
  //   recipients.forEach(({ recipient, receivedOn }) => {
  //     const { id, rutNum, rutDv, name, division, phone, email } = recipient;
  //     result = [
  //       ...result,
  //       {
  //         receivedOn: receivedOn,
  //         person: {
  //           id,
  //           name,
  //           division,
  //           phone,
  //           email,
  //           rut: `${rutNum}-${rutDv}`,
  //         },
  //       },
  //     ];
  //   });
  //
  //   return result;
  // }

  @Mutation(() => DocumentResponse, { nullable: true })
  @UseMiddleware(isClerk)
  async updateDocument(
    @Arg('docId', () => Int) docId: number,
    @Arg('metadata', () => DocumentUpdateInput) metadata: DocumentUpdateInput,
    @Arg('sender', () => Int) sender: number,
    @Arg('recipients', () => [RecipientInput])
    recipients: RecipientInput[]
  ): Promise<DocumentResponse> {
    let ret: DocumentResponse = {
      status: {
        status: 'error',
        message: 'Could not update document',
      },
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const findResult = await queryRunner.manager
        .getRepository(Document)
        .createQueryBuilder('doc')
        .select([
          'doc.docNumber',
          'doc.subject',
          'doc.writtenOn',
          'doc.sentOn',
          'doc.docType',
        ])
        .where('doc.id = :docId', { docId })
        .getOne();

      if (!findResult) {
        ret = {
          status: {
            status: 'error',
            message: 'Document not found',
          },
        };

        throw new Error('Document not found');
      }

      let newMetadata: any = { ...findResult, ...metadata };

      await queryRunner.connection
        .createQueryBuilder()
        .update(Document)
        .set({ ...newMetadata })
        .where('id = :docId', { docId })
        .execute();

      if (sender) {
        await queryRunner.connection
          .createQueryBuilder()
          .update(Document)
          .set({ sender: { id: sender } })
          .where('id = :docId', { docId })
          .execute();
      }

      if (recipients) {
        // FIXME: definitvamente hay una mejor forma de hacer esto que no
        // involucre eliminar todos los registros de destinatarios y reagregarlos.
        // De momento me conformo con esto

        await queryRunner.connection
          .createQueryBuilder()
          .delete()
          .from(DocumentPerson)
          .where('document = :docId', { docId })
          .execute();

        for (let { person, receivedOn } of recipients) {
          await queryRunner.manager
            .getRepository(DocumentPerson)
            .createQueryBuilder('dp')
            .insert()
            .values({
              receivedOn: receivedOn,
              recipient: { id: person },
              document: { id: docId },
            })
            .execute();
        }
      }

      const checkResult = await queryRunner.manager
        .getRepository(Document)
        .createQueryBuilder('doc')
        .leftJoinAndSelect('doc.docType', 'doct')
        .leftJoinAndSelect('doc.sender', 'sen')
        .leftJoinAndSelect('doc.files', 'files')
        .leftJoinAndSelect('doc.recordedBy', 'rec')
        .where('doc.id = :docId', { docId })
        .getOne();

      const recipientIdsResult = await queryRunner.manager
        .getRepository(DocumentPerson)
        .createQueryBuilder('dp')
        .leftJoin('dp.recipient', 'recip')
        .select(['recip.id', 'dp.received_on'])
        .where('dp.document = :docId', {
          docId,
        })
        .getRawMany();

      const recipientIds = recipientIdsResult.map((rec) => {
        return rec.recip_id;
      });

      const recipientData = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .where('per.id in (:...recipientIds)', { recipientIds })
        .getMany();

      const senderData = await queryRunner.manager
        .getRepository(Person)
        .createQueryBuilder('per')
        .where('per.id = :sender', { sender: checkResult!.sender.id })
        .getOne();

      ret = {
        status: { status: 'ok' },
        document: {
          ...checkResult!,
          writtenOn: checkResult!.writtenOn,
          sender: {
            id: senderData!.id,
            name: senderData!.name,
            division: senderData!.division,
            phone: senderData!.phone,
            email: senderData!.email,
            rut: `${senderData!.rutNum}-${senderData!.rutDv}`,
          },
          sentOn: checkResult!.sentOn,
          recipients: recipientData.map((recipient) => {
            const {
              id,
              rutNum,
              rutDv,
              name,
              division,
              phone,
              email,
            } = recipient;
            return {
              person: {
                id,
                name,
                division,
                phone,
                email,
                rut: `${rutNum}-${rutDv}`,
              },
              receivedOn: recipientIdsResult.find(
                ({ recip_id }) => recip_id === recipient.id
              )!['received_on']!,
            };
          }),
          files: [],
        },
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }

  @Mutation(() => StatusResponse)
  @UseMiddleware(isClerk)
  async deleteDocument(
    @Arg('id', () => Int) id: number
  ): Promise<StatusResponse> {
    let ret: StatusResponse = {
      status: 'error',
      message: 'Could not delete document',
    };

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const findResult = await queryRunner.manager
        .getRepository(Document)
        .createQueryBuilder('doc')
        .select('doc.id')
        .where('doc.id = :id', { id })
        .getOne();

      if (!findResult) {
        ret = {
          status: 'error',
          message: 'Document not found',
        };

        throw new Error('Document not found');
      }

      await queryRunner.connection
        .createQueryBuilder()
        .delete()
        .from(Document)
        .where('id = :id', { id })
        .execute();

      ret = {
        status: 'ok',
      };

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return ret;
  }
}
