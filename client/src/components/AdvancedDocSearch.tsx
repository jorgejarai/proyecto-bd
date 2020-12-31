import React, { Dispatch, SetStateAction } from 'react';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setCriteria: Dispatch<SetStateAction<any>>;
}

export const AdvancedDocSearch: React.FC<Props> = (props) => {
  return <div>A</div>;
};
