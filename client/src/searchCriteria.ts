export type SearchCriterionType = {
  criterion: 'id' | 'docType' | 'docNumber' | 'subject' | 'sender';
  displayName: string;
};

export const searchCriteriaTypes: SearchCriterionType[] = [
  {
    criterion: 'id',
    displayName: 'No.',
  },
  {
    criterion: 'docType',
    displayName: 'Document type',
  },
  {
    criterion: 'docNumber',
    displayName: 'Document no.',
  },
  {
    criterion: 'subject',
    displayName: 'Subject',
  },
  {
    criterion: 'sender',
    displayName: 'Sender',
  },
];

export type DateRange = {
  start: Date;
  end: Date;
};

export type SearchCriterionEntry = {
  criterion:
    | 'id'
    | 'docType'
    | 'docNumber'
    | 'subject'
    | 'writtenOn'
    | 'sentOn'
    | 'sender'
    | 'recorder'
    | 'keyword';
  value: DateRange | string | number;
};
