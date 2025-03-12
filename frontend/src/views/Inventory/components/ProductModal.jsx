import React from 'react';

const ProductModal = ({ show, product, onChange, onSubmit, onClose, title, locations }) => {
  if (!show) return null;
  return (
    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header py-2">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body py-2">
              <div className="mb-2">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  name="name"
                  value={product.name || ''}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control form-control-sm"
                  name="description"
                  value={product.description || ''}
                  onChange={onChange}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  name="price"
                  value={product.price || ''}
                  onChange={onChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  name="stock"
                  value={product.stock || ''}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Ubicación</label>
                <select
                  className="form-control form-control-sm"
                  name="ubicacion_id"
                  value={product.ubicacion_id || ''}
                  onChange={onChange}
                  required
                >
                  <option value="">Seleccione una ubicación</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer py-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
