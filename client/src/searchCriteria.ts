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

export const advancedSearchKeywordCriteriaTypes: SearchCriterionType[] = [
  {
    criterion: 'id',
    displayName: 'No.',
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

export type RecorderDisplay = {
  id: number;
  name: string;
};

export type DocumentTypeDisplay = {
  id: number;
  name: string;
};

export type KeywordSearchCriterion = {
  type: 'id' | 'docNumber' | 'subject' | 'sender';
  value: string;
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
  value:
    | DateRange
    | string
    | number
    | RecorderDisplay
    | DocumentTypeDisplay
    | KeywordSearchCriterion;
};
