import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const requiredFields = ["nombre", "codigo", "stock", "precio", "categoria"];

const FileImport = ({ onImportSuccess }) => {
  const fileInputRef = useRef(null);

  const handleImportFile = () => {
    fileInputRef.current.click();
    toast.info("Selecciona un archivo para importar.");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Convertir a JSON con encabezados
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!jsonData || jsonData.length === 0) {
          toast.error("El archivo está vacío.");
          return;
        }
        const headers = jsonData[0].map((header) => header.toString().toLowerCase());
        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field)
        );
        if (missingFields.length > 0) {
          toast.error("Faltan campos requeridos: " + missingFields.join(", "));
          return;
        }
        // Se puede procesar la data (omitimos la fila de encabezados)
        const dataRows = jsonData.slice(1);
        toast.success("Archivo importado correctamente.");
        if (onImportSuccess) {
          onImportSuccess(dataRows);
        }
      };
      reader.onerror = (error) => {
        console.error("Error al leer el archivo:", error);
        toast.error("Error al leer el archivo.");
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button className="btn btn-success btn-sm rounded-pill" onClick={handleImportFile}>
        Importar Archivos
      </button>
    </>
  );
};

export default FileImport;
