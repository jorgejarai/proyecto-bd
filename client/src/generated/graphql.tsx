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
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  hello: Scalars['String'];
  bye: Scalars['String'];
  users: Array<User>;
  me?: Maybe<User>;
  persons: Array<Person>;
  person?: Maybe<Person>;
  personAddress?: Maybe<Address>;
  documents: Array<DocumentResponse>;
  document?: Maybe<DocumentResponse>;
  documentTypes: Array<DocumentType>;
  address?: Maybe<Address>;
};


export type QueryPersonArgs = {
  id: Scalars['Int'];
};


export type QueryPersonAddressArgs = {
  date?: Maybe<Scalars['DateTime']>;
  id: Scalars['Int'];
};


export type QueryDocumentArgs = {
  id: Scalars['Float'];
};


export type QueryAddressArgs = {
  id: Scalars['Int'];
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

export type Person = {
  __typename?: 'Person';
  id: Scalars['Int'];
  rut?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  division?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['Int']>;
  email?: Maybe<Scalars['String']>;
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


export type DocumentResponse = {
  __typename?: 'DocumentResponse';
  document: Document;
  sender: Person;
  recipients: Array<Recipient>;
  files: Array<File>;
};

export type Document = {
  __typename?: 'Document';
  id: Scalars['Int'];
  docNumber?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  writtenOn?: Maybe<Scalars['DateTime']>;
  docType: DocumentType;
  recordedBy: User;
  sender: Person;
  sentOn?: Maybe<Scalars['DateTime']>;
};

export type DocumentType = {
  __typename?: 'DocumentType';
  id: Scalars['Int'];
  typeName: Scalars['String'];
};

export type Recipient = {
  __typename?: 'Recipient';
  person: Person;
  receivedOn: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  id: Scalars['Int'];
  description: Scalars['String'];
  mediaType: Scalars['String'];
  blob: Scalars['String'];
  fileSize: Scalars['Float'];
};

export type Mutation = {
  __typename?: 'Mutation';
  revokeRefreshTokens: Scalars['Boolean'];
  logout: Scalars['Boolean'];
  login: LoginResponse;
  register: RegisterResponse;
  addPerson?: Maybe<Person>;
  addDocument?: Maybe<Document>;
  addAddress?: Maybe<Scalars['Int']>;
};


export type MutationRevokeRefreshTokensArgs = {
  userId: Scalars['Int'];
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


export type MutationAddPersonArgs = {
  phone?: Maybe<Scalars['Int']>;
  email?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Int']>;
  division?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  rut?: Maybe<Scalars['String']>;
};


export type MutationAddDocumentArgs = {
  sentOn?: Maybe<Scalars['String']>;
  sender: Scalars['Int'];
  docType: Scalars['Int'];
  writtenOn?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  docNumber?: Maybe<Scalars['String']>;
};


export type MutationAddAddressArgs = {
  country: Scalars['Int'];
  postalCode?: Maybe<Scalars['String']>;
  address: Scalars['String'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  status: Scalars['String'];
  accessToken?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  message?: Maybe<Scalars['String']>;
};

export type RegisterResponse = {
  __typename?: 'RegisterResponse';
  status: Scalars['String'];
  message?: Maybe<Scalars['String']>;
};

export type AddAddressMutationVariables = Exact<{
  address: Scalars['String'];
  postalCode?: Maybe<Scalars['String']>;
  country: Scalars['Int'];
}>;


export type AddAddressMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'addAddress'>
);

export type AddDocumentMutationVariables = Exact<{
  docNumber?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  writtenOn?: Maybe<Scalars['String']>;
  docType: Scalars['Int'];
  sender: Scalars['Int'];
  sentOn?: Maybe<Scalars['String']>;
}>;


export type AddDocumentMutation = (
  { __typename?: 'Mutation' }
  & { addDocument?: Maybe<(
    { __typename?: 'Document' }
    & Pick<Document, 'id' | 'docNumber' | 'subject' | 'writtenOn' | 'sentOn'>
    & { docType: (
      { __typename?: 'DocumentType' }
      & Pick<DocumentType, 'id'>
    ), recordedBy: (
      { __typename?: 'User' }
      & Pick<User, 'id'>
    ), sender: (
      { __typename?: 'Person' }
      & Pick<Person, 'id'>
    ) }
  )> }
);

export type AddPersonMutationVariables = Exact<{
  rut?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  division?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Int']>;
  email?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['Int']>;
}>;


export type AddPersonMutation = (
  { __typename?: 'Mutation' }
  & { addPerson?: Maybe<(
    { __typename?: 'Person' }
    & Pick<Person, 'id' | 'rut' | 'name' | 'division' | 'phone' | 'email'>
  )> }
);

export type DocumentTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentTypesQuery = (
  { __typename?: 'Query' }
  & { documentTypes: Array<(
    { __typename?: 'DocumentType' }
    & Pick<DocumentType, 'id' | 'typeName'>
  )> }
);

export type DocumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type DocumentsQuery = (
  { __typename?: 'Query' }
  & { documents: Array<(
    { __typename?: 'DocumentResponse' }
    & { document: (
      { __typename?: 'Document' }
      & Pick<Document, 'id' | 'docNumber' | 'subject' | 'writtenOn' | 'sentOn'>
      & { docType: (
        { __typename?: 'DocumentType' }
        & Pick<DocumentType, 'typeName'>
      ), recordedBy: (
        { __typename?: 'User' }
        & Pick<User, 'id'>
      ) }
    ), sender: (
      { __typename?: 'Person' }
      & Pick<Person, 'id' | 'name'>
    ), recipients: Array<(
      { __typename?: 'Recipient' }
      & Pick<Recipient, 'receivedOn'>
      & { person: (
        { __typename?: 'Person' }
        & Pick<Person, 'id' | 'name'>
      ) }
    )> }
  )> }
);

export type HelloQueryVariables = Exact<{ [key: string]: never; }>;


export type HelloQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'hello'>
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'LoginResponse' }
    & Pick<LoginResponse, 'status' | 'message' | 'accessToken'>
    & { user?: Maybe<(
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
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name' | 'username' | 'email' | 'division' | 'isClerk'>
  )> }
);

export type PersonsQueryVariables = Exact<{ [key: string]: never; }>;


export type PersonsQuery = (
  { __typename?: 'Query' }
  & { persons: Array<(
    { __typename?: 'Person' }
    & Pick<Person, 'id' | 'name' | 'rut' | 'division' | 'phone' | 'email'>
  )> }
);

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'RegisterResponse' }
    & Pick<RegisterResponse, 'status' | 'message'>
  ) }
);

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = (
  { __typename?: 'Query' }
  & { users: Array<(
    { __typename?: 'User' }
    & Pick<User, 'id' | 'name' | 'email'>
  )> }
);


export const AddAddressDocument = gql`
    mutation AddAddress($address: String!, $postalCode: String, $country: Int!) {
  addAddress(address: $address, postalCode: $postalCode, country: $country)
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
    mutation AddDocument($docNumber: String, $subject: String!, $writtenOn: String, $docType: Int!, $sender: Int!, $sentOn: String) {
  addDocument(
    docNumber: $docNumber
    subject: $subject
    writtenOn: $writtenOn
    docType: $docType
    sender: $sender
    sentOn: $sentOn
  ) {
    id
    docNumber
    subject
    writtenOn
    docType {
      id
    }
    recordedBy {
      id
    }
    sender {
      id
    }
    sentOn
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
    mutation AddPerson($rut: String, $name: String!, $division: String, $address: Int, $email: String, $phone: Int) {
  addPerson(
    rut: $rut
    name: $name
    division: $division
    address: $address
    email: $email
    phone: $phone
  ) {
    id
    rut
    name
    division
    phone
    email
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
export const DocumentTypesDocument = gql`
    query DocumentTypes {
  documentTypes {
    id
    typeName
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
    document {
      id
      docType {
        typeName
      }
      docNumber
      subject
      writtenOn
      recordedBy {
        id
      }
      sentOn
    }
    sender {
      id
      name
    }
    recipients {
      person {
        id
        name
      }
      receivedOn
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
export const HelloDocument = gql`
    query Hello {
  hello
}
    `;

/**
 * __useHelloQuery__
 *
 * To run a query within a React component, call `useHelloQuery` and pass it any options that fit your needs.
 * When your component renders, `useHelloQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHelloQuery({
 *   variables: {
 *   },
 * });
 */
export function useHelloQuery(baseOptions?: Apollo.QueryHookOptions<HelloQuery, HelloQueryVariables>) {
        return Apollo.useQuery<HelloQuery, HelloQueryVariables>(HelloDocument, baseOptions);
      }
export function useHelloLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HelloQuery, HelloQueryVariables>) {
          return Apollo.useLazyQuery<HelloQuery, HelloQueryVariables>(HelloDocument, baseOptions);
        }
export type HelloQueryHookResult = ReturnType<typeof useHelloQuery>;
export type HelloLazyQueryHookResult = ReturnType<typeof useHelloLazyQuery>;
export type HelloQueryResult = Apollo.QueryResult<HelloQuery, HelloQueryVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    status
    message
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
    id
    name
    username
    email
    division
    isClerk
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
export const PersonsDocument = gql`
    query Persons {
  persons {
    id
    name
    rut
    division
    phone
    email
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
export const UsersDocument = gql`
    query Users {
  users {
    id
    name
    email
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