import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          data-test="lanc_modal_confirm_btn_confirmar"
          onClick={onConfirm}
        >
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
