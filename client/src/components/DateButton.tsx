import React from 'react';
import { Button } from 'react-bootstrap';

interface Props {
  value: string;
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export const DateButton: React.FC<Props> = ({ value, onClick }) => (
  <Button onClick={onClick}>{value}</Button>
);
