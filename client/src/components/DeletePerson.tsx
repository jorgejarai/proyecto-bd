import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface Props {
  show: boolean;
  onFailedClose: () => void;
  onSuccessfulClose: () => void;
}

export const DeletePerson: React.FC<Props> = ({
  show,
  onFailedClose,
  onSuccessfulClose,
}) => {
  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Confirm delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure to delete this person?
        <br />
        Bear in mind that any documents where this person is the sender or the
        only recipient will be deleted as well.
      </Modal.Body>
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
