"use client";

//app/(main)/test


import { useState } from "react";
import { db } from "@/app/lib/firebase"; // ⭐ THIS ALWAYS WORKS

import { collection, addDoc } from "firebase/firestore";

export default function TestAdd() {
  const [name, setName] = useState("");

  const handleAdd = async () => {
    await addDoc(collection(db, "students"), {
      name: name,
      createdAt: Date.now(),
    });

    alert("Student added!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Student</h1>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <button onClick={handleAdd} className="bg-blue-500 text-white p-2 ml-2">
        Save
      </button>
    </div>
  );
}
