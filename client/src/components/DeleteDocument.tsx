import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  onFailedClose: () => void;
  onSuccessfulClose: () => void;
}

export const DeleteDocument: React.FC<Props> = ({
  show,
  onFailedClose,
  onSuccessfulClose,
}) => {
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Confirm delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure to delete this document?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onFailedClose()}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => onSuccessfulClose()}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
