import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  users: UsersResponse;
  me: UserResponse;
  persons: PersonsResponse;
  person?: Maybe<PersonResponse>;
  personNames: PersonNamesResponse;
  documents: DocumentsResponse;
  document: DocumentResponse;
  documentTypes: DocumentTypesResponse;
  countries: CountriesResponse;
};


export type QueryPersonArgs = {
  id: Scalars['Int'];
};


export type QueryDocumentArgs = {
  id: Scalars['Int'];
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  status: StatusResponse;
  users: Array<User>;
};

export type StatusResponse = {
  __typename?: 'StatusResponse';
  status: Scalars['String'];
  message?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  username: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
  division?: Maybe<Scalars['String']>;
  isClerk: Scalars['Boolean'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  status: StatusResponse;
  user?: Maybe<User>;
};

export type PersonsResponse = {
  __typename?: 'PersonsResponse';
  status: StatusResponse;
  persons: Array<PersonOutput>;
};

export type PersonOutput = {
  __typename?: 'PersonOutput';
  id: Scalars['Int'];
  rut?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  division?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  address?: Maybe<Address>;
};

export type Address = {
  __typename?: 'Address';
  id: Scalars['Int'];
  address: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
  country: Country;
};

export type Country = {
  __typename?: 'Country';
  countryNumber: Scalars['Int'];
  name: Scalars['String'];
  isoName: Scalars['String'];
  alpha2: Scalars['String'];
  alpha3: Scalars['String'];
};

export type PersonResponse = {
  __typename?: 'PersonResponse';
  person?: Maybe<PersonOutput>;
  status: StatusResponse;
};

export type PersonNamesResponse = {
  __typename?: 'PersonNamesResponse';
  status: StatusResponse;
  personNames: Array<PersonNameOutput>;
};

export type PersonNameOutput = {
  __typename?: 'PersonNameOutput';
  id: Scalars['Int'];
  label: Scalars['String'];
};

export type DocumentsResponse = {
  __typename?: 'DocumentsResponse';
  status: StatusResponse;
  documents: Array<DocumentOutput>;
};

export type DocumentOutput = {
  __typename?: 'DocumentOutput';
  id: Scalars['Int'];
  docNumber?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  writtenOn?: Maybe<Scalars['String']>;
  docType: DocumentType;
  recordedBy: User;
  sender?: Maybe<PersonOutput>;
  sentOn?: Maybe<Scalars['String']>;
  recipients?: Maybe<Array<RecipientResponse>>;
  files?: Maybe<Array<File>>;
};

export type DocumentType = {
  __typename?: 'DocumentType';
  id: Scalars['Int'];
  typeName: Scalars['String'];
};

export type RecipientResponse = {
  __typename?: 'RecipientResponse';
  person: PersonOutput;
  receivedOn: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  id: Scalars['Int'];
  description: Scalars['String'];
  blob: Scalars['String'];
};

export type DocumentResponse = {
  __typename?: 'DocumentResponse';
  status: StatusResponse;
  document?: Maybe<DocumentOutput>;
};

export type DocumentTypesResponse = {
  __typename?: 'DocumentTypesResponse';
  status: StatusResponse;
  docTypes: Array<DocumentType>;
};

export type CountriesResponse = {
  __typename?: 'CountriesResponse';
  status: StatusResponse;
  countries: Array<Country>;
};

export type Mutation = {
  __typename?: 'Mutation';
  logout: Scalars['Boolean'];
  login: LoginResponse;
  register: StatusResponse;
  changePassword: StatusResponse;
  addPerson: PersonResponse;
  updatePerson: PersonResponse;
  updatePersonAndAddress: PersonResponse;
  deletePerson: StatusResponse;
  addDocument: DocumentResponse;
  updateDocument?: Maybe<DocumentResponse>;
  deleteDocument: StatusResponse;
  addAddress: AddressResponse;
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationRegisterArgs = {
  password: Scalars['String'];
  name: Scalars['String'];
  email: Scalars['String'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  user: Scalars['Int'];
};


export type MutationAddPersonArgs = {
  phone?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Int']>;
  division?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  rut?: Maybe<Scalars['Int']>;
};


export type MutationUpdatePersonArgs = {
  data: PersonUpdateInput;
  perId: Scalars['Int'];
};


export type MutationUpdatePersonAndAddressArgs = {
  country: Scalars['Int'];
  postalCode?: Maybe<Scalars['String']>;
  address: Scalars['String'];
  data: PersonUpdateInput;
  person: Scalars['Int'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['Int'];
};


export type MutationAddDocumentArgs = {
  recipients: Array<RecipientInput>;
  sentOn?: Maybe<Scalars['String']>;
  sender: Scalars['Int'];
  docType: Scalars['Int'];
  writtenOn?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  docNumber?: Maybe<Scalars['String']>;
};


export type MutationUpdateDocumentArgs = {
  recipients: Array<RecipientInput>;
  sender: Scalars['Int'];
  metadata: DocumentUpdateInput;
  docId: Scalars['Int'];
};


export type MutationDeleteDocumentArgs = {
  id: Scalars['Int'];
};


export type MutationAddAddressArgs = {
  country: Scalars['Int'];
  postalCode?: Maybe<Scalars['String']>;
  address: Scalars['String'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  status: StatusResponse;
  accessToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type PersonUpdateInput = {
  rutNum?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  division?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
};

export type RecipientInput = {
  person: Scalars['Int'];
  receivedOn: Scalars['String'];
};

export type DocumentUpdateInput = {
  docNumber?: Maybe<Scalars['String']>;
  subject?: Maybe<Scalars['String']>;
  writtenOn?: Maybe<Scalars['String']>;
  docType?: Maybe<Scalars['Int']>;
  sentOn?: Maybe<Scalars['String']>;
};

export type AddressResponse = {
  __typename?: 'AddressResponse';
  status: StatusResponse;
  address?: Maybe<Address>;
};

export type AddAddressMutationVariables = Exact<{
  address: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
  country: Scalars['Int'];
}>;


export type AddAddressMutation = (
  { __typename?: 'Mutation' }
  & { addAddress: (
    { __typename?: 'AddressResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), address?: Maybe<(
      { __typename?: 'Address' }
      & Pick<Address, 'id' | 'address' | 'postalCode'>
      & { country: (
        { __typename?: 'Country' }
        & Pick<Country, 'countryNumber'>
      ) }
    )> }
  ) }
);

export type AddDocumentMutationVariables = Exact<{
  docNumber?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  writtenOn?: Maybe<Scalars['String']>;
  docType: Scalars['Int'];
  sender: Scalars['Int'];
  sentOn?: Maybe<Scalars['String']>;
  recipients: Array<RecipientInput>;
}>;


export type AddDocumentMutation = (
  { __typename?: 'Mutation' }
  & { addDocument: (
    { __typename?: 'DocumentResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), document?: Maybe<(
      { __typename?: 'DocumentOutput' }
      & Pick<DocumentOutput, 'id' | 'docNumber' | 'subject' | 'writtenOn' | 'sentOn'>
      & { docType: (
        { __typename?: 'DocumentType' }
        & Pick<DocumentType, 'id' | 'typeName'>
      ), recordedBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'name'>
      ), sender?: Maybe<(
        { __typename?: 'PersonOutput' }
        & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
      )>, recipients?: Maybe<Array<(
        { __typename?: 'RecipientResponse' }
        & Pick<RecipientResponse, 'receivedOn'>
        & { person: (
          { __typename?: 'PersonOutput' }
          & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
        ) }
      )>> }
    )> }
  ) }
);

export type AddPersonMutationVariables = Exact<{
  rut?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  division?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Int']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
}>;


export type AddPersonMutation = (
  { __typename?: 'Mutation' }
  & { addPerson: (
    { __typename?: 'PersonResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), person?: Maybe<(
      { __typename?: 'PersonOutput' }
      & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
      & { address?: Maybe<(
        { __typename?: 'Address' }
        & Pick<Address, 'id' | 'address' | 'postalCode'>
        & { country: (
          { __typename?: 'Country' }
          & Pick<Country, 'name'>
        ) }
      )> }
    )> }
  ) }
);

export type ChangePasswordMutationVariables = Exact<{
  user: Scalars['Int'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & { changePassword: (
    { __typename?: 'StatusResponse' }
    & Pick<StatusResponse, 'status' | 'message'>
  ) }
);

export type CountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CountriesQuery = (
  { __typename?: 'Query' }
  & { countries: (
    { __typename?: 'CountriesResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), countries: Array<(
      { __typename?: 'Country' }
      & Pick<Country, 'countryNumber' | 'name' | 'isoName' | 'alpha2' | 'alpha3'>
    )> }
  ) }
);

export type DeleteDocumentMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteDocumentMutation = (
  { __typename?: 'Mutation' }
  & { deleteDocument: (
    { __typename?: 'StatusResponse' }
    & Pick<StatusResponse, 'status' | 'message'>
  ) }
);

export type DeletePersonMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeletePersonMutation = (
  { __typename?: 'Mutation' }
  & { deletePerson: (
    { __typename?: 'StatusResponse' }
    & Pick<StatusResponse, 'status' | 'message'>
  ) }
);

export type DocumentQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DocumentQuery = (
  { __typename?: 'Query' }
  & { document: (
    { __typename?: 'DocumentResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), document?: Maybe<(
      { __typename?: 'DocumentOutput' }
      & Pick<DocumentOutput, 'id' | 'docNumber' | 'subject' | 'writtenOn' | 'sentOn'>
      & { docType: (
        { __typename?: 'DocumentType' }
        & Pick<DocumentType, 'id' | 'typeName'>
      ), recordedBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'username' | 'name' | 'email' | 'isClerk'>
      ), sender?: Maybe<(
        { __typename?: 'PersonOutput' }
        & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
      )>, recipients?: Maybe<Array<(
        { __typename?: 'RecipientResponse' }
        & Pick<RecipientResponse, 'receivedOn'>
        & { person: (
          { __typename?: 'PersonOutput' }
          & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
        ) }
      )>> }
    )> }
  ) }
);

export type DocumentTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentTypesQuery = (
  { __typename?: 'Query' }
  & { documentTypes: (
    { __typename?: 'DocumentTypesResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), docTypes: Array<(
      { __typename?: 'DocumentType' }
      & Pick<DocumentType, 'id' | 'typeName'>
    )> }
  ) }
);

export type DocumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentsQuery = (
  { __typename?: 'Query' }
  & { documents: (
    { __typename?: 'DocumentsResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), documents: Array<(
      { __typename?: 'DocumentOutput' }
      & Pick<DocumentOutput, 'id' | 'docNumber' | 'subject' | 'writtenOn' | 'sentOn'>
      & { docType: (
        { __typename?: 'DocumentType' }
        & Pick<DocumentType, 'id' | 'typeName'>
      ), recordedBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'username' | 'name' | 'email' | 'isClerk'>
      ), sender?: Maybe<(
        { __typename?: 'PersonOutput' }
        & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
      )>, recipients?: Maybe<Array<(
        { __typename?: 'RecipientResponse' }
        & Pick<RecipientResponse, 'receivedOn'>
        & { person: (
          { __typename?: 'PersonOutput' }
          & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
        ) }
      )>> }
    )> }
  ) }
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'LoginResponse' }
    & Pick<LoginResponse, 'accessToken'>
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'username' | 'email' | 'division' | 'isClerk'>
    )> }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'UserResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'username' | 'email' | 'division' | 'isClerk'>
    )> }
  ) }
);

export type PersonQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type PersonQuery = (
  { __typename?: 'Query' }
  & { person?: Maybe<(
    { __typename?: 'PersonResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), person?: Maybe<(
      { __typename?: 'PersonOutput' }
      & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
      & { address?: Maybe<(
        { __typename?: 'Address' }
        & Pick<Address, 'id' | 'address' | 'postalCode'>
        & { country: (
          { __typename?: 'Country' }
          & Pick<Country, 'countryNumber' | 'name'>
        ) }
      )> }
    )> }
  )> }
);

export type PersonNamesQueryVariables = Exact<{ [key: string]: never; }>;


export type PersonNamesQuery = (
  { __typename?: 'Query' }
  & { personNames: (
    { __typename?: 'PersonNamesResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), personNames: Array<(
      { __typename?: 'PersonNameOutput' }
      & Pick<PersonNameOutput, 'id' | 'label'>
    )> }
  ) }
);

export type PersonsQueryVariables = Exact<{ [key: string]: never; }>;


export type PersonsQuery = (
  { __typename?: 'Query' }
  & { persons: (
    { __typename?: 'PersonsResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), persons: Array<(
      { __typename?: 'PersonOutput' }
      & Pick<PersonOutput, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
      & { address?: Maybe<(
        { __typename?: 'Address' }
        & Pick<Address, 'address' | 'postalCode'>
        & { country: (
          { __typename?: 'Country' }
          & Pick<Country, 'countryNumber' | 'name'>
        ) }
      )> }
    )> }
  ) }
);

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'StatusResponse' }
    & Pick<StatusResponse, 'status' | 'message'>
  ) }
);

export type UpdateDocumentMutationVariables = Exact<{
  docId: Scalars['Int'];
  metadata: DocumentUpdateInput;
  sender: Scalars['Int'];
  recipients: Array<RecipientInput>;
}>;


export type UpdateDocumentMutation = (
  { __typename?: 'Mutation' }
  & { updateDocument?: Maybe<(
    { __typename?: 'DocumentResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), document?: Maybe<(
      { __typename?: 'DocumentOutput' }
      & Pick<DocumentOutput, 'subject' | 'writtenOn' | 'sentOn'>
      & { docType: (
        { __typename?: 'DocumentType' }
        & Pick<DocumentType, 'id' | 'typeName'>
      ), recordedBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'name'>
      ), sender?: Maybe<(
        { __typename?: 'PersonOutput' }
        & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
      )>, recipients?: Maybe<Array<(
        { __typename?: 'RecipientResponse' }
        & Pick<RecipientResponse, 'receivedOn'>
        & { person: (
          { __typename?: 'PersonOutput' }
          & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
        ) }
      )>> }
    )> }
  )> }
);

export type UpdatePersonMutationVariables = Exact<{
  perId: Scalars['Int'];
  data: PersonUpdateInput;
}>;


export type UpdatePersonMutation = (
  { __typename?: 'Mutation' }
  & { updatePerson: (
    { __typename?: 'PersonResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), person?: Maybe<(
      { __typename?: 'PersonOutput' }
      & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
    )> }
  ) }
);

export type UpdatePersonAndAddressMutationVariables = Exact<{
  person: Scalars['Int'];
  data: PersonUpdateInput;
  address: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
  country: Scalars['Int'];
}>;


export type UpdatePersonAndAddressMutation = (
  { __typename?: 'Mutation' }
  & { updatePersonAndAddress: (
    { __typename?: 'PersonResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), person?: Maybe<(
      { __typename?: 'PersonOutput' }
      & Pick<PersonOutput, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
      & { address?: Maybe<(
        { __typename?: 'Address' }
        & Pick<Address, 'id' | 'address' | 'postalCode'>
        & { country: (
          { __typename?: 'Country' }
          & Pick<Country, 'countryNumber'>
        ) }
      )> }
    )> }
  ) }
);

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = (
  { __typename?: 'Query' }
  & { users: (
    { __typename?: 'UsersResponse' }
    & { status: (
      { __typename?: 'StatusResponse' }
      & Pick<StatusResponse, 'status' | 'message'>
    ), users: Array<(
      { __typename?: 'User' }
      & Pick<User, 'id' | 'name' | 'email'>
    )> }
  ) }
);


export const AddAddressDocument = gql`
    mutation AddAddress($address: String!, $postalCode: String, $country: Int!) {
  addAddress(address: $address, postalCode: $postalCode, country: $country) {
    status {
      status
      message
    }
    address {
      id
      address
      postalCode
      country {
        countryNumber
      }
    }
  }
}
    `;
export type AddAddressMutationFn = Apollo.MutationFunction<AddAddressMutation, AddAddressMutationVariables>;

/**
 * __useAddAddressMutation__
 *
 * To run a mutation, you first call `useAddAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAddressMutation, { data, loading, error }] = useAddAddressMutation({
 *   variables: {
 *      address: // value for 'address'
 *      postalCode: // value for 'postalCode'
 *      country: // value for 'country'
 *   },
 * });
 */
export function useAddAddressMutation(baseOptions?: Apollo.MutationHookOptions<AddAddressMutation, AddAddressMutationVariables>) {
        return Apollo.useMutation<AddAddressMutation, AddAddressMutationVariables>(AddAddressDocument, baseOptions);
      }
export type AddAddressMutationHookResult = ReturnType<typeof useAddAddressMutation>;
export type AddAddressMutationResult = Apollo.MutationResult<AddAddressMutation>;
export type AddAddressMutationOptions = Apollo.BaseMutationOptions<AddAddressMutation, AddAddressMutationVariables>;
export const AddDocumentDocument = gql`
    mutation AddDocument($docNumber: String, $subject: String!, $writtenOn: String, $docType: Int!, $sender: Int!, $sentOn: String, $recipients: [RecipientInput!]!) {
  addDocument(
    docNumber: $docNumber
    subject: $subject
    writtenOn: $writtenOn
    docType: $docType
    sender: $sender
    sentOn: $sentOn
    recipients: $recipients
  ) {
    status {
      status
      message
    }
    document {
      id
      docNumber
      subject
      writtenOn
      docType {
        id
        typeName
      }
      recordedBy {
        id
        name
      }
      sender {
        id
        rut
        name
        division
        phone
        email
      }
      sentOn
      recipients {
        person {
          id
          rut
          name
          division
          phone
          email
        }
        receivedOn
      }
    }
  }
}
    `;
export type AddDocumentMutationFn = Apollo.MutationFunction<AddDocumentMutation, AddDocumentMutationVariables>;

/**
 * __useAddDocumentMutation__
 *
 * To run a mutation, you first call `useAddDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDocumentMutation, { data, loading, error }] = useAddDocumentMutation({
 *   variables: {
 *      docNumber: // value for 'docNumber'
 *      subject: // value for 'subject'
 *      writtenOn: // value for 'writtenOn'
 *      docType: // value for 'docType'
 *      sender: // value for 'sender'
 *      sentOn: // value for 'sentOn'
 *      recipients: // value for 'recipients'
 *   },
 * });
 */
export function useAddDocumentMutation(baseOptions?: Apollo.MutationHookOptions<AddDocumentMutation, AddDocumentMutationVariables>) {
        return Apollo.useMutation<AddDocumentMutation, AddDocumentMutationVariables>(AddDocumentDocument, baseOptions);
      }
export type AddDocumentMutationHookResult = ReturnType<typeof useAddDocumentMutation>;
export type AddDocumentMutationResult = Apollo.MutationResult<AddDocumentMutation>;
export type AddDocumentMutationOptions = Apollo.BaseMutationOptions<AddDocumentMutation, AddDocumentMutationVariables>;
export const AddPersonDocument = gql`
    mutation AddPerson($rut: Int, $name: String!, $division: String, $address: Int, $email: String, $phone: String) {
  addPerson(
    rut: $rut
    name: $name
    division: $division
    address: $address
    email: $email
    phone: $phone
  ) {
    status {
      status
      message
    }
    person {
      id
      rut
      name
      division
      phone
      email
      address {
        id
        address
        postalCode
        country {
          name
        }
      }
    }
  }
}
    `;
export type AddPersonMutationFn = Apollo.MutationFunction<AddPersonMutation, AddPersonMutationVariables>;

/**
 * __useAddPersonMutation__
 *
 * To run a mutation, you first call `useAddPersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPersonMutation, { data, loading, error }] = useAddPersonMutation({
 *   variables: {
 *      rut: // value for 'rut'
 *      name: // value for 'name'
 *      division: // value for 'division'
 *      address: // value for 'address'
 *      email: // value for 'email'
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useAddPersonMutation(baseOptions?: Apollo.MutationHookOptions<AddPersonMutation, AddPersonMutationVariables>) {
        return Apollo.useMutation<AddPersonMutation, AddPersonMutationVariables>(AddPersonDocument, baseOptions);
      }
export type AddPersonMutationHookResult = ReturnType<typeof useAddPersonMutation>;
export type AddPersonMutationResult = Apollo.MutationResult<AddPersonMutation>;
export type AddPersonMutationOptions = Apollo.BaseMutationOptions<AddPersonMutation, AddPersonMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($user: Int!, $newPassword: String!) {
  changePassword(user: $user, newPassword: $newPassword) {
    status
    message
  }
}
    `;
export type ChangePasswordMutationFn = Apollo.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      user: // value for 'user'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, baseOptions);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const CountriesDocument = gql`
    query Countries {
  countries {
    status {
      status
      message
    }
    countries {
      countryNumber
      name
      isoName
      alpha2
      alpha3
    }
  }
}
    `;

/**
 * __useCountriesQuery__
 *
 * To run a query within a React component, call `useCountriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCountriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCountriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCountriesQuery(baseOptions?: Apollo.QueryHookOptions<CountriesQuery, CountriesQueryVariables>) {
        return Apollo.useQuery<CountriesQuery, CountriesQueryVariables>(CountriesDocument, baseOptions);
      }
export function useCountriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CountriesQuery, CountriesQueryVariables>) {
          return Apollo.useLazyQuery<CountriesQuery, CountriesQueryVariables>(CountriesDocument, baseOptions);
        }
export type CountriesQueryHookResult = ReturnType<typeof useCountriesQuery>;
export type CountriesLazyQueryHookResult = ReturnType<typeof useCountriesLazyQuery>;
export type CountriesQueryResult = Apollo.QueryResult<CountriesQuery, CountriesQueryVariables>;
export const DeleteDocumentDocument = gql`
    mutation DeleteDocument($id: Int!) {
  deleteDocument(id: $id) {
    status
    message
  }
}
    `;
export type DeleteDocumentMutationFn = Apollo.MutationFunction<DeleteDocumentMutation, DeleteDocumentMutationVariables>;

/**
 * __useDeleteDocumentMutation__
 *
 * To run a mutation, you first call `useDeleteDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDocumentMutation, { data, loading, error }] = useDeleteDocumentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDocumentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDocumentMutation, DeleteDocumentMutationVariables>) {
        return Apollo.useMutation<DeleteDocumentMutation, DeleteDocumentMutationVariables>(DeleteDocumentDocument, baseOptions);
      }
export type DeleteDocumentMutationHookResult = ReturnType<typeof useDeleteDocumentMutation>;
export type DeleteDocumentMutationResult = Apollo.MutationResult<DeleteDocumentMutation>;
export type DeleteDocumentMutationOptions = Apollo.BaseMutationOptions<DeleteDocumentMutation, DeleteDocumentMutationVariables>;
export const DeletePersonDocument = gql`
    mutation DeletePerson($id: Int!) {
  deletePerson(id: $id) {
    status
    message
  }
}
    `;
export type DeletePersonMutationFn = Apollo.MutationFunction<DeletePersonMutation, DeletePersonMutationVariables>;

/**
 * __useDeletePersonMutation__
 *
 * To run a mutation, you first call `useDeletePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePersonMutation, { data, loading, error }] = useDeletePersonMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePersonMutation(baseOptions?: Apollo.MutationHookOptions<DeletePersonMutation, DeletePersonMutationVariables>) {
        return Apollo.useMutation<DeletePersonMutation, DeletePersonMutationVariables>(DeletePersonDocument, baseOptions);
      }
export type DeletePersonMutationHookResult = ReturnType<typeof useDeletePersonMutation>;
export type DeletePersonMutationResult = Apollo.MutationResult<DeletePersonMutation>;
export type DeletePersonMutationOptions = Apollo.BaseMutationOptions<DeletePersonMutation, DeletePersonMutationVariables>;
export const DocumentDocument = gql`
    query Document($id: Int!) {
  document(id: $id) {
    status {
      status
      message
    }
    document {
      id
      docType {
        id
        typeName
      }
      docNumber
      subject
      writtenOn
      recordedBy {
        id
        username
        name
        email
        isClerk
      }
      sender {
        id
        name
        rut
        division
        phone
        email
      }
      sentOn
      recipients {
        person {
          id
          name
          rut
          division
          phone
          email
        }
        receivedOn
      }
    }
  }
}
    `;

/**
 * __useDocumentQuery__
 *
 * To run a query within a React component, call `useDocumentQuery` and pass it any options that fit your needs.
 * When your component renders, `useDocumentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocumentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDocumentQuery(baseOptions?: Apollo.QueryHookOptions<DocumentQuery, DocumentQueryVariables>) {
        return Apollo.useQuery<DocumentQuery, DocumentQueryVariables>(DocumentDocument, baseOptions);
      }
export function useDocumentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocumentQuery, DocumentQueryVariables>) {
          return Apollo.useLazyQuery<DocumentQuery, DocumentQueryVariables>(DocumentDocument, baseOptions);
        }
export type DocumentQueryHookResult = ReturnType<typeof useDocumentQuery>;
export type DocumentLazyQueryHookResult = ReturnType<typeof useDocumentLazyQuery>;
export type DocumentQueryResult = Apollo.QueryResult<DocumentQuery, DocumentQueryVariables>;
export const DocumentTypesDocument = gql`
    query DocumentTypes {
  documentTypes {
    status {
      status
      message
    }
    docTypes {
      id
      typeName
    }
  }
}
    `;

/**
 * __useDocumentTypesQuery__
 *
 * To run a query within a React component, call `useDocumentTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDocumentTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocumentTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useDocumentTypesQuery(baseOptions?: Apollo.QueryHookOptions<DocumentTypesQuery, DocumentTypesQueryVariables>) {
        return Apollo.useQuery<DocumentTypesQuery, DocumentTypesQueryVariables>(DocumentTypesDocument, baseOptions);
      }
export function useDocumentTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocumentTypesQuery, DocumentTypesQueryVariables>) {
          return Apollo.useLazyQuery<DocumentTypesQuery, DocumentTypesQueryVariables>(DocumentTypesDocument, baseOptions);
        }
export type DocumentTypesQueryHookResult = ReturnType<typeof useDocumentTypesQuery>;
export type DocumentTypesLazyQueryHookResult = ReturnType<typeof useDocumentTypesLazyQuery>;
export type DocumentTypesQueryResult = Apollo.QueryResult<DocumentTypesQuery, DocumentTypesQueryVariables>;
export const DocumentsDocument = gql`
    query Documents {
  documents {
    status {
      status
      message
    }
    documents {
      id
      docType {
        id
        typeName
      }
      docNumber
      subject
      writtenOn
      recordedBy {
        id
        username
        name
        email
        isClerk
      }
      sender {
        id
        name
        rut
        division
        phone
        email
      }
      sentOn
      recipients {
        person {
          id
          name
          rut
          division
          phone
          email
        }
        receivedOn
      }
    }
  }
}
    `;

/**
 * __useDocumentsQuery__
 *
 * To run a query within a React component, call `useDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDocumentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<DocumentsQuery, DocumentsQueryVariables>) {
        return Apollo.useQuery<DocumentsQuery, DocumentsQueryVariables>(DocumentsDocument, baseOptions);
      }
export function useDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DocumentsQuery, DocumentsQueryVariables>) {
          return Apollo.useLazyQuery<DocumentsQuery, DocumentsQueryVariables>(DocumentsDocument, baseOptions);
        }
export type DocumentsQueryHookResult = ReturnType<typeof useDocumentsQuery>;
export type DocumentsLazyQueryHookResult = ReturnType<typeof useDocumentsLazyQuery>;
export type DocumentsQueryResult = Apollo.QueryResult<DocumentsQuery, DocumentsQueryVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    status {
      status
      message
    }
    user {
      id
      name
      username
      email
      division
      isClerk
    }
    accessToken
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    status {
      status
      message
    }
    user {
      id
      name
      username
      email
      division
      isClerk
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const PersonDocument = gql`
    query Person($id: Int!) {
  person(id: $id) {
    status {
      status
      message
    }
    person {
      id
      name
      rut
      division
      phone
      email
      address {
        id
        address
        postalCode
        country {
          countryNumber
          name
        }
      }
    }
  }
}
    `;

/**
 * __usePersonQuery__
 *
 * To run a query within a React component, call `usePersonQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePersonQuery(baseOptions?: Apollo.QueryHookOptions<PersonQuery, PersonQueryVariables>) {
        return Apollo.useQuery<PersonQuery, PersonQueryVariables>(PersonDocument, baseOptions);
      }
export function usePersonLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PersonQuery, PersonQueryVariables>) {
          return Apollo.useLazyQuery<PersonQuery, PersonQueryVariables>(PersonDocument, baseOptions);
        }
export type PersonQueryHookResult = ReturnType<typeof usePersonQuery>;
export type PersonLazyQueryHookResult = ReturnType<typeof usePersonLazyQuery>;
export type PersonQueryResult = Apollo.QueryResult<PersonQuery, PersonQueryVariables>;
export const PersonNamesDocument = gql`
    query PersonNames {
  personNames {
    status {
      status
      message
    }
    personNames {
      id
      label
    }
  }
}
    `;

/**
 * __usePersonNamesQuery__
 *
 * To run a query within a React component, call `usePersonNamesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonNamesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonNamesQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonNamesQuery(baseOptions?: Apollo.QueryHookOptions<PersonNamesQuery, PersonNamesQueryVariables>) {
        return Apollo.useQuery<PersonNamesQuery, PersonNamesQueryVariables>(PersonNamesDocument, baseOptions);
      }
export function usePersonNamesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PersonNamesQuery, PersonNamesQueryVariables>) {
          return Apollo.useLazyQuery<PersonNamesQuery, PersonNamesQueryVariables>(PersonNamesDocument, baseOptions);
        }
export type PersonNamesQueryHookResult = ReturnType<typeof usePersonNamesQuery>;
export type PersonNamesLazyQueryHookResult = ReturnType<typeof usePersonNamesLazyQuery>;
export type PersonNamesQueryResult = Apollo.QueryResult<PersonNamesQuery, PersonNamesQueryVariables>;
export const PersonsDocument = gql`
    query Persons {
  persons {
    status {
      status
      message
    }
    persons {
      id
      name
      rut
      division
      phone
      email
      address {
        address
        postalCode
        country {
          countryNumber
          name
        }
      }
    }
  }
}
    `;

/**
 * __usePersonsQuery__
 *
 * To run a query within a React component, call `usePersonsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePersonsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePersonsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePersonsQuery(baseOptions?: Apollo.QueryHookOptions<PersonsQuery, PersonsQueryVariables>) {
        return Apollo.useQuery<PersonsQuery, PersonsQueryVariables>(PersonsDocument, baseOptions);
      }
export function usePersonsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PersonsQuery, PersonsQueryVariables>) {
          return Apollo.useLazyQuery<PersonsQuery, PersonsQueryVariables>(PersonsDocument, baseOptions);
        }
export type PersonsQueryHookResult = ReturnType<typeof usePersonsQuery>;
export type PersonsLazyQueryHookResult = ReturnType<typeof usePersonsLazyQuery>;
export type PersonsQueryResult = Apollo.QueryResult<PersonsQuery, PersonsQueryVariables>;
export const RegisterDocument = gql`
    mutation Register($email: String!, $name: String!, $password: String!) {
  register(email: $email, name: $name, password: $password) {
    status
    message
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      email: // value for 'email'
 *      name: // value for 'name'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, baseOptions);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const UpdateDocumentDocument = gql`
    mutation UpdateDocument($docId: Int!, $metadata: DocumentUpdateInput!, $sender: Int!, $recipients: [RecipientInput!]!) {
  updateDocument(
    docId: $docId
    metadata: $metadata
    sender: $sender
    recipients: $recipients
  ) {
    status {
      status
      message
    }
    document {
      subject
      writtenOn
      docType {
        id
        typeName
      }
      recordedBy {
        id
        name
      }
      sender {
        id
        rut
        name
        division
        phone
        email
      }
      sentOn
      recipients {
        person {
          id
          rut
          name
          division
          phone
          email
        }
        receivedOn
      }
    }
  }
}
    `;
export type UpdateDocumentMutationFn = Apollo.MutationFunction<UpdateDocumentMutation, UpdateDocumentMutationVariables>;

/**
 * __useUpdateDocumentMutation__
 *
 * To run a mutation, you first call `useUpdateDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDocumentMutation, { data, loading, error }] = useUpdateDocumentMutation({
 *   variables: {
 *      docId: // value for 'docId'
 *      metadata: // value for 'metadata'
 *      sender: // value for 'sender'
 *      recipients: // value for 'recipients'
 *   },
 * });
 */
export function useUpdateDocumentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDocumentMutation, UpdateDocumentMutationVariables>) {
        return Apollo.useMutation<UpdateDocumentMutation, UpdateDocumentMutationVariables>(UpdateDocumentDocument, baseOptions);
      }
export type UpdateDocumentMutationHookResult = ReturnType<typeof useUpdateDocumentMutation>;
export type UpdateDocumentMutationResult = Apollo.MutationResult<UpdateDocumentMutation>;
export type UpdateDocumentMutationOptions = Apollo.BaseMutationOptions<UpdateDocumentMutation, UpdateDocumentMutationVariables>;
export const UpdatePersonDocument = gql`
    mutation UpdatePerson($perId: Int!, $data: PersonUpdateInput!) {
  updatePerson(perId: $perId, data: $data) {
    status {
      status
      message
    }
    person {
      id
      rut
      name
      division
      phone
      email
    }
  }
}
    `;
export type UpdatePersonMutationFn = Apollo.MutationFunction<UpdatePersonMutation, UpdatePersonMutationVariables>;

/**
 * __useUpdatePersonMutation__
 *
 * To run a mutation, you first call `useUpdatePersonMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePersonMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePersonMutation, { data, loading, error }] = useUpdatePersonMutation({
 *   variables: {
 *      perId: // value for 'perId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdatePersonMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePersonMutation, UpdatePersonMutationVariables>) {
        return Apollo.useMutation<UpdatePersonMutation, UpdatePersonMutationVariables>(UpdatePersonDocument, baseOptions);
      }
export type UpdatePersonMutationHookResult = ReturnType<typeof useUpdatePersonMutation>;
export type UpdatePersonMutationResult = Apollo.MutationResult<UpdatePersonMutation>;
export type UpdatePersonMutationOptions = Apollo.BaseMutationOptions<UpdatePersonMutation, UpdatePersonMutationVariables>;
export const UpdatePersonAndAddressDocument = gql`
    mutation UpdatePersonAndAddress($person: Int!, $data: PersonUpdateInput!, $address: String!, $postalCode: String, $country: Int!) {
  updatePersonAndAddress(
    person: $person
    data: $data
    address: $address
    postalCode: $postalCode
    country: $country
  ) {
    status {
      status
      message
    }
    person {
      id
      rut
      name
      division
      phone
      email
      address {
        id
        address
        postalCode
        country {
          countryNumber
        }
      }
    }
  }
}
    `;
export type UpdatePersonAndAddressMutationFn = Apollo.MutationFunction<UpdatePersonAndAddressMutation, UpdatePersonAndAddressMutationVariables>;

/**
 * __useUpdatePersonAndAddressMutation__
 *
 * To run a mutation, you first call `useUpdatePersonAndAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePersonAndAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePersonAndAddressMutation, { data, loading, error }] = useUpdatePersonAndAddressMutation({
 *   variables: {
 *      person: // value for 'person'
 *      data: // value for 'data'
 *      address: // value for 'address'
 *      postalCode: // value for 'postalCode'
 *      country: // value for 'country'
 *   },
 * });
 */
export function useUpdatePersonAndAddressMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePersonAndAddressMutation, UpdatePersonAndAddressMutationVariables>) {
        return Apollo.useMutation<UpdatePersonAndAddressMutation, UpdatePersonAndAddressMutationVariables>(UpdatePersonAndAddressDocument, baseOptions);
      }
export type UpdatePersonAndAddressMutationHookResult = ReturnType<typeof useUpdatePersonAndAddressMutation>;
export type UpdatePersonAndAddressMutationResult = Apollo.MutationResult<UpdatePersonAndAddressMutation>;
export type UpdatePersonAndAddressMutationOptions = Apollo.BaseMutationOptions<UpdatePersonAndAddressMutation, UpdatePersonAndAddressMutationVariables>;
export const UsersDocument = gql`
    query Users {
  users {
    status {
      status
      message
    }
    users {
      id
      name
      email
    }
  }
}
    `;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, baseOptions);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;