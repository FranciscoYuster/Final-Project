import React, { useState } from 'react';

const Home = () => {
  // Estado inicial con algunas tareas
    const [tasks, setTasks] = useState([
      { id: 1, text: 'Expresión regular de los inputs', completed: false },
      { id: 2, text: 'Crear User Stories en gituhb', completed: false },
      { id: 3, text: 'Construir Paginas', completed: false },
      { id: 4, text: 'Debe quedar responsivo', completed: false },
    ]);
    
    // Estado para el nuevo texto a agregar y para ocultar las tareas completadas
    const [newTask, setNewTask] = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);
  
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
  
          {/* Checkbox para ocultar tareas completadas */}
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="hideCompleted"
              checked={hideCompleted}
              onChange={() => setHideCompleted(!hideCompleted)}
            />
            <label className="form-check-label" htmlFor="hideCompleted">
              Ocultar tareas completadas
            </label>
          </div>
  
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