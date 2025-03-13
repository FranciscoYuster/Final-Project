import React from 'react';
import { Button, Modal, Table, Form, InputGroup, Pagination } from "react-bootstrap";


const ProductModal = ({ show, product, onChange, onSubmit, onClose, title, locations }) => {
  if (!show) return null;
  return (
    
    <div className="modal show" style={{ display: 'block'}} role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-content">

            <Modal.Header closeButton onClick={onClose}>
              <Modal.Title className="modal-title">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={onSubmit}>
              <Form.Group controlId='formNombre'>
                <Form.Label className="form-label">Nombre</Form.Label>
                <Form.Control placeholder='Nombre del producto'
                  type="text"
                  className="rounded-pill"
                  name="name"
                  value={product.name || ''}
                  onChange={onChange} 
                  style={{ borderColor: "#074de3" }}
                  required
                />
              </Form.Group>
              <Form.Group className="formDescription">
                <Form.Label className="form-label">Descripción</Form.Label>
                <Form.Control placeholder='Descripción del producto'
                  className="rounded-pill"
                  name="description"
                  value={product.description || ''} rows={3}
                  onChange={onChange}
                  style={{ borderColor: "#074de3" }}
                />
              </Form.Group>
              <Form.Group className="formPrecio">
                <Form.Label className="form-label">Precio</Form.Label>
                <Form.Control placeholder='Precio del producto'
                  type="number"
                  className="rounded-pill"
                  name="price"
                  value={product.price || ''}
                  onChange={onChange}
                  step="0.01"
                  style={{ borderColor: "#074de3" }}
                  required
                />
              </Form.Group>
              <Form.Group
               className="formStock">
                <Form.Label className="form-label">Stock</Form.Label>
                <Form.Control placeholder='Stock del producto'
                  type="number"
                  className="rounded-pill"
                  name="stock"
                  value={product.stock || ''}
                  onChange={onChange}
                  style={{ borderColor: "#074de3" }}
                  required
                />
              </Form.Group>
              <Form.Group className="formUbicacion">
                <Form.Label className="form-label">Ubicación</Form.Label>
                <Form.Select
                  className="rounded-pill"
                  name="ubicacion_id"
                  value={product.ubicacion_id || ''}
                  onChange={onChange}
                  style={{ borderColor: "#074de3" }}
                  required
                >
                  <option value="">Seleccione una ubicación</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button type="submit" className="mt-3 rounded-pill" variant='primary' style={{ backgroundColor: "#074de3", borderColor: "#074de3" }} onClick={onSubmit}>
                Crear
              </Button>
          </Form>
            </Modal.Body>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
