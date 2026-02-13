import React, { useState } from 'react';
import { CheckCircle, Meh, Frown, Smile, DollarSign } from 'lucide-react';

export default function Trackers() {
  // STATE for Checklist
  const [todos, setTodos] = useState([
    { id: 1, text: "Drink water 💧", done: false },
    { id: 2, text: "Take a deep breath 🌿", done: false },
    { id: 3, text: "Skin care routine ✨", done: false }
  ]);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="trackers-grid">
      
      {/* 1. MOOD TRACKER */}
      <div className="tracker-box mood-box">
        <h3>How are you feeling?</h3>
        <div className="mood-buttons">
          <button className="mood-btn"><Smile size={32} color="#556b2f"/></button>
          <button className="mood-btn"><Meh size={32} color="#8fbc8f"/></button>
          <button className="mood-btn"><Frown size={32} color="#a9c3a9"/></button>
        </div>
      </div>

      {/* 2. GENTLE CHECKLIST */}
      <div className="tracker-box checklist-box">
        <h3>Gentle Checklist</h3>
        <ul>
          {todos.map(todo => (
            <li key={todo.id} 
                onClick={() => toggleTodo(todo.id)}
                className={todo.done ? "done" : ""}>
              <CheckCircle size={18} />
              {todo.text}
            </li>
          ))}
        </ul>
      </div>

      {/* 3. MINI BUDGET */}
      <div className="tracker-box budget-box">
        <h3>Budget</h3>
        <div className="budget-row">
          <span>🧋 Treats</span>
          <input type="number" placeholder="$0" />
        </div>
        <div className="budget-row">
          <span>🛍️ Shopping</span>
          <input type="number" placeholder="$0" />
        </div>
      </div>

    </div>
  );
}