import Swal from "sweetalert2";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  toggleImportant,
  reorderTasks,
} from "./api/taskApi";
import "./App.css";


function App() {
  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingId) {
  await updateTask(editingId, {
    title,
    description,
    dueDate,
  });

  toast.info("Task Updated Successfully");

  setEditingId(null);
} else {
  await createTask({
  title,
  description,
  dueDate,
  important: false,
});

  toast.success("Task Added Successfully");
}

    setTitle("");
    setDescription("");
    setDueDate("");

    loadTasks();
  };

  const handleToggle = async (id) => {
  await toggleTask(id);

  toast.success("Task Status Updated");

  loadTasks();
};

const handleImportant = async (task) => {
  await toggleImportant(task.id);

  const updatedTasks = tasks.map((t) =>
    t.id === task.id
      ? { ...t, important: !t.important }
      : t
  );

  const importantTasks = updatedTasks
    .filter((t) => t.important)
    .sort(
      (a, b) =>
        new Date(a.dueDate || "9999-12-31") -
        new Date(b.dueDate || "9999-12-31")
    );

  const normalTasks = updatedTasks.filter(
    (t) => !t.important
  );

  const finalTasks = [
    ...importantTasks,
    ...normalTasks,
  ];

  setTasks(finalTasks);

  await reorderTasks(finalTasks);

  if (task.important) {
    toast.info("Task removed from important");
  } else {
    toast.success("Task marked as important");
  }

  loadTasks();
};

const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const draggedTask =
filteredTasks[result.source.index];

if (draggedTask?.important) {
  toast.error(
    "Important tasks cannot be moved"
  );
  return;
}

if (
  result.destination.index <
  tasks.filter(task => task.important).length
) {
  toast.error(
    "Tasks cannot be moved above important tasks"
  );
  return;
}

if (draggedTask?.important) {
  toast.error(
    "Important tasks cannot be moved"
  );
  return;
}

  const items = Array.from(tasks);

  const [reorderedItem] = items.splice(
    result.source.index,
    1
  );

  items.splice(
    result.destination.index,
    0,
    reorderedItem
  );

  setTasks(items);

  await reorderTasks(items);

  // toast.success("Task reordered");
};

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Delete Task?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Delete",
    cancelButtonText: "Keep Task",
  });

  if (!result.isConfirmed) return;

  await deleteTask(id);

  toast.success("Task Deleted");

  loadTasks();
};

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
  };

 const filteredTasks = tasks
  .filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  )
  .filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  })

  return (
  <>
    <div className="container">
  <div className="hero">
  <h2>TaskFlow</h2>

  <h1>
    Organize your work.
    <br />
    Stay focused.
  </h1>

  <p>
    A simple and modern task manager to track work,
    manage priorities and stay productive every day.
  </p>
</div>

<h3 className="form-heading">
  Create New Task
</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="form-buttons">
  <button type="submit">
    {editingId ? "Update Task" : "Add Task"}
  </button>

  {editingId && (
    <button
      type="button"
      className="cancel-btn"
      onClick={() => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setDueDate("");
      }}
    >
      Cancel
    </button>
  )}
</div>
      </form>

      <div className="stats">

  <div className="stat-card">
    <h3>{tasks.length}</h3>
    <p>Total Tasks</p>
  </div>

  <div className="stat-card">
    <h3>
      {tasks.filter(task => task.important).length}
    </h3>
    <p>Important Tasks</p>
  </div>

  <div className="stat-card">
    <h3>
      {tasks.filter(task => !task.completed).length}
    </h3>
    <p>Active Tasks</p>
  </div>

  <div className="stat-card">
    <h3>
      {tasks.filter(task => task.completed).length}
    </h3>
    <p>Completed Tasks</p>
  </div>

</div>

<div className="search-filter">
  <input
    type="text"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

<div className="filters">
  <button
    type="button"
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    type="button"
    onClick={() => setFilter("active")}
  >
    Active
  </button>

  <button
    type="button"
    onClick={() => setFilter("completed")}
  >
    Completed
  </button>
</div>
</div>

      <h2 className="tasks-heading">Tasks</h2>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
  No tasks found 🚀
</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="tasks">
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {filteredTasks.map((task, index) => (
          <Draggable
            key={task.id}
            draggableId={task.id}
            index={index}
          >
            {(provided) => (
              <div
  className={`task-card ${
    isOverdue(task.dueDate, task.completed)
      ? "overdue-card"
      : ""
  }`}
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
>
  <h3>
  {task.important && "⭐ "}
  {task.title}
</h3>

  <p>{task.description}</p>

  <p>
  <strong>Due:</strong>{" "}
  {task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB")
    : "No Date"}
</p>

<div>
  <span
    className={
      task.completed
        ? "status completed"
        : "status active"
    }
  >
    {task.completed
      ? "Completed"
      : "Active"}
  </span>

  {isOverdue(task.dueDate, task.completed) && (
    <span className="status overdue">
      Overdue
    </span>
  )}
</div>

 <div className="task-actions">

  <button
  className="important-btn"
  onClick={() =>
  handleImportant(task)
}
>
  {task.important
    ? "⭐ Important"
    : "☆ Important"}
</button>

  <button
    className="complete-btn"
    onClick={() =>
      handleToggle(task.id)
    }
  >
                {task.completed
                  ? "Mark Active"
                  : "Mark Complete"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleEdit(task)
                }
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(task.id)
                }
              >
                Delete
              </button>
            </div>
                       </div>
            )}
          </Draggable>
        ))}

        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
)}
    </div>

    <ToastContainer
      position="top-right"
      autoClose={2000}
    />
  </>
);
}

export default App;