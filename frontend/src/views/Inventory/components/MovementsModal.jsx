import React from 'react';

const MovementsModal = ({ show, movements, onClose }) => {
  if (!show) return null;
  return (
    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header py-2">
            <h5 className="modal-title">Historial de Movimientos</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body py-2">
            <table className="table table-bordered table-sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov, index) => (
                  <tr key={mov.id}>
                    <td>{index + 1}</td>
                    <td>{mov.type}</td>
                    <td>{mov.quantity}</td>
                    <td>{new Date(mov.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">No se encontraron movimientos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-footer py-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementsModal;
