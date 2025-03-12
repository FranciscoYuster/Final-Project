import React, { useState } from 'react';

const Home = () => {
  // Estado inicial con algunas tareas
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Home - Página principal (ruta: /)', completed: true },
    { id: 2, text: 'Login - Página para iniciar sesión (ruta: /login)', completed: true },
    { id: 3, text: 'Register - Página para registrarse (ruta: /register)', completed: true },
    { id: 4, text: 'ForgotPassword - Recuperar contraseña (ruta: /forgot)', completed: true },
    { id: 6, text: 'Services - Página de servicios (ruta: /services)', completed: false },
    { id: 7, text: 'Error404 - Página de error (ruta: *)', completed: true },
    { id: 8, text: 'Dashboard - Perfil o panel principal (ruta: /profile)', completed: true },
    { id: 9, text: 'Facturas - Gestión de facturas (ruta: /facturas)', completed: true },
    { id: 10, text: 'Clientes - Administración de clientes (ruta: /clientes)', completed: true },
    { id: 11, text: 'Productos - Gestión de productos (ruta: /productos)', completed: false },
    { id: 12, text: 'Ventas - Manejo de ventas (ruta: /ventas)', completed: false },
    { id: 13, text: 'Compras - Gestión de compras (ruta: /compras)', completed: false },
    { id: 14, text: 'Usuarios - Administración de usuarios (ruta: /usuarios)', completed: false },
    { id: 15, text: 'Proveedores - Gestión de proveedores (ruta: /proveed)', completed: true },
    { id: 16, text: 'Reportes - Visualización de reportes (ruta: /reports)', completed: false },
    { id: 17, text: 'InventoryManagement - Gestión de inventario (ruta: /inventory)', completed: false }
  ]);
  
    // Estado para el nuevo texto a agregar y para ocultar las tareas completadas
    const [newTask, setNewTask] = useState('');
    const [hideCompleted, setHideCompleted] = useState(true);
  
    // Alternar el estado "completed" de una tarea
    const toggleTask = (id) => {
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    };
  
    // Agregar nueva tarea
    const addTask = (e) => {
      e.preventDefault();
      if (!newTask.trim()) return;
      const newTaskItem = {
        id: Date.now(),
        text: newTask,
        completed: false,
      };
      setTasks([...tasks, newTaskItem]);
      setNewTask('');
    };
  
    // Filtrar tareas según el estado de ocultar completadas
    const visibleTasks = hideCompleted ? tasks.filter(task => !task.completed) : tasks;
  
    return (
      <div className="container my-5">
        <div className="jumbotron p-5 rounded">
          <h1 className="display-4">¡Services!</h1>
          <p className="lead">
            Revisa el estado de las tareas:
          </p>
          <hr className="my-4" />
          {/* Lista de tareas */}
          <ul className="list-group">
            {visibleTasks.map(task => (
              <li
                key={task.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  task.completed ? 'list-group-item-success' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleTask(task.id)}
              >
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.text}
                </span>
                {task.completed && (
                  <span className="badge bg-success rounded-pill">
                    ✓
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
export default Home;