import React from 'react';

const KPISection = ({ totalProducts, totalStock, lowStockCount }) => (
  <div className="row mb-3">
    <div className="col-md-4 mb-2">
      <div className="card bg-primary text-white">
        <div className="card-body p-2">
          <h6 className="card-title">Total de Productos</h6>
          <p className="card-text">{totalProducts}</p>
        </div>
      </div>
    </div>
    <div className="col-md-4 mb-2">
      <div className="card bg-success text-white">
        <div className="card-body p-2">
          <h6 className="card-title">Stock Total</h6>
          <p className="card-text">{totalStock}</p>
        </div>
      </div>
    </div>
    <div className="col-md-4 mb-2">
      <div className="card bg-danger text-white">
        <div className="card-body p-2">
          <h6 className="card-title">Stock Bajo</h6>
          <p className="card-text">{lowStockCount}</p>
        </div>
      </div>
    </div>
  </div>
);

export default KPISection;
