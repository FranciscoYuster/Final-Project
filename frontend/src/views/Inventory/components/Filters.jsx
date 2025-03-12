import React from 'react';

const Filters = ({ globalFilter, setGlobalFilter, minPrice, setMinPrice, maxPrice, setMaxPrice }) => (
  <div className="mb-3">
    <input
      type="text"
      className="form-control form-control-sm mb-2"
      placeholder="Búsqueda global (nombre o descripción)..."
      value={globalFilter}
      onChange={e => setGlobalFilter(e.target.value)}
      style={{ fontSize: '0.8rem' }}
    />
    <div className="d-flex gap-2">
      <input
        type="number"
        className="form-control form-control-sm"
        placeholder="Precio mínimo"
        value={minPrice}
        onChange={e => setMinPrice(e.target.value)}
        style={{ fontSize: '0.8rem' }}
      />
      <input
        type="number"
        className="form-control form-control-sm"
        placeholder="Precio máximo"
        value={maxPrice}
        onChange={e => setMaxPrice(e.target.value)}
        style={{ fontSize: '0.8rem' }}
      />
    </div>
  </div>
);

export default Filters;
