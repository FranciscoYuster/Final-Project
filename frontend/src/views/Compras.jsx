import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, InputGroup, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Compras = () => {

  const [purchases, setPurchase] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  cosnt[editPurchase, setEditPurchase] = useState(null)
  cosnt[deletePurchase, setDeletePurchase] = useState(null)
  cosnt[deletePurchase, setDeletePurchase] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [locations, setLocations] = useState([]);
  const itemsPerPage = 10;

  // Estado para una nueva compra

  const [newPurchase, setNewPurchase] = useState({
    numero_comprobante: "",
    orden_compra: "",
    metodo: "",
    provider_id: "",
    product_id: "",
    inventory_id: "",
    quantity: "",
    total: "",
    status: "",
    type: ""
  });


  const token = sessionStorage.getItem("access_token");

  useEffect(() => {
    fetchPurchases();
  }, [])

  const fetchPurchases = () => {
    fetch("/api/purchases", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json()
      })
      .then(data => setPurchase(data))
      .catch((error) => {
        console.error("Error al obtener compras", err);
        toast.error("Error al cargar compras!")
      })
  }

  // Filtrado y paginacion

  const filteredPurchases = purchases.filter(purchase =>
    purchase.orden_compra.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentItems = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const handleSelectPurchases = (id) => {
    if (selectedPurchases.includes(id)) {
      setSelectedPurchases(selectedPurchases.filter(purchases => purchases !== id))
    } else {
      setSelectedPurchases([...selectedPurchases, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedPurchases.length === currentItems.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(currentItems.map((producto) => producto.id));
    }
  };

  // Abrir modal

  const handleShowModal = (purchases = null) => {
    setEditPurchase(purchases);
    if (purchases) {
      setNewPurchase({
        numero_comprobante: purchases.invoice && purchases.invoice.numero_comprobante ? purchases.invoice.numero_comprobante : "",
        orden_compra: purchases.orden_compra,
        metodo: purchases.metodo,
        provider_id: purchases.provider_id,
        product_id: purchases.product_id,
        inventory_id: purchases.inventory_id,
        quantity: purchases.quantity,
        total: purchases.total,
        status: purchases.status,
        type: purchases.type
      })
    } else {
      setNewPurchase({
        numero_comprobante: "",
        orden_compra: "",
        metodo: "",
        provider_id: "",
        product_id: "",
        inventory_id: "",
        quantity: "",
        total: "",
        status: "",
        type: ""
      })
    }
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPurchase(null);
    setNewPurchase({
      numero_comprobante: "",
      orden_compra: "",
      metodo: "",
      provider_id: "",
      product_id: "",
      inventory_id: "",
      quantity: "",
      total: "",
      status: "",
      type: ""
    })
  };















  return (
    <div>Compras</div>
  )
}

export default Compras