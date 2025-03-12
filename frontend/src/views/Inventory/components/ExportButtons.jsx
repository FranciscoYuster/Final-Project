import React from 'react';
import { FaFileCsv, FaFileExcel, FaFilePdf } from 'react-icons/fa';

const ExportButtons = ({ exportCSV, exportXLSX, exportPDF }) => (
  <div className="mb-2 d-flex gap-2">
    <button className="btn btn-success btn-sm" onClick={exportCSV}>
      <FaFileCsv className="me-1" /> CSV
    </button>
    <button className="btn btn-info btn-sm" onClick={exportXLSX}>
      <FaFileExcel className="me-1" /> XLSX
    </button>
    <button className="btn btn-danger btn-sm" onClick={exportPDF}>
      <FaFilePdf className="me-1" /> PDF
    </button>
  </div>
);

export default ExportButtons;
