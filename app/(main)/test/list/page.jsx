"use client";
//app/(main)/test/list/page.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/app/lib/firebase"; // adjust if needed

export default function StudentsListPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Real-time listener
    const q = query(
      collection(db, "students"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {students.length === 0 && <p>No students found.</p>}

      <div className="space-y-3">
        {students.map((s) => (
          <div
            key={s.id}
            className="p-3 border rounded shadow-sm bg-white"
          >
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-500">
              {s.createdAt
                ? new Date(s.createdAt).toLocaleString()
                : "No timestamp"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
