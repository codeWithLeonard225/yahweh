'use client';

import React, { useState, useEffect } from "react";
// Updated Imports
import { db } from "@/app/lib/firebase";
import { schoollpq } from "@/app/lilschoollpq/schoollpq";
import { useAuth } from "@/app/context/AuthContext";
import { 
    collection, 
    setDoc, 
    doc, 
    serverTimestamp, 
    onSnapshot,
    query, 
    where,
    updateDoc,
    getDoc 
} from "firebase/firestore";
import localforage from "localforage";
import { toast } from "react-toastify";

// 💾 Initialize localforage stores
const assignmentStore = typeof window !== 'undefined' ? localforage.createInstance({ 
    name: "TeacherDataCache",
    storeName: "teacher_assignments",
}) : null;

const topicStore = typeof window !== 'undefined' ? localforage.createInstance({ 
    name: "TopicDataCache",
    storeName: "topics_list",
}) : null;

const TeacherQuestionsPageTheory = () => {
    const { user } = useAuth();
    
    // Consistent with the Objectives page fallback
    const schoolId = user?.schoolId || "N/A";

    const [academicYear] = useState("2025/2026");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTopic, setSelectedTopic] = useState(""); 
    const [newTopicName, setNewTopicName] = useState("");  
    const [topics, setTopics] = useState([]); 

    const [selectedTest, setSelectedTest] = useState("Term 1 T1");
    const [assignments, setAssignments] = useState([]);

    // Simplified structure for Theory
    const [questions, setQuestions] = useState([
        { number: 1, question: "", topic: "" },
    ]);

    const [fetchedQuestions, setFetchedQuestions] = useState([]);
    const [existingDocId, setExistingDocId] = useState(null);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const teacherName = user?.data?.teacherName;
    const tests = ["Term 1 T1", "Term 1 Exam", "Term 2 T1", "Term 2 Exam", "Term 3 T1", "Term 3 Exam"];

    // 1. 📋 LOAD TEACHER ASSIGNMENTS (Cache-First)
    useEffect(() => {
        if (!teacherName || !schoolId || !assignmentStore) return;
        const ASSIGNMENTS_CACHE_KEY = `assignments_${schoolId}_${teacherName}`;

        const loadAndListenAssignments = async () => {
            try {
                const cachedData = await assignmentStore.getItem(ASSIGNMENTS_CACHE_KEY);
                if (cachedData && cachedData.data) {
                    setAssignments(cachedData.data);
                    if (cachedData.data.length > 0 && !selectedClass) {
                        setSelectedClass(cachedData.data[0].className);
                        setSelectedSubject(cachedData.data[0].subjects[0]);
                    }
                }
            } catch (e) { console.error("Cache Error:", e); }

            const q = query(
                collection(db, "TeacherAssignments"),
                where("teacher", "==", teacherName),
                where("schoolId", "==", schoolId)
            );

            const unsub = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAssignments(data);
                if (data.length > 0 && !selectedClass) {
                    setSelectedClass(data[0].className);
                    setSelectedSubject(data[0].subjects[0]);
                }
                assignmentStore.setItem(ASSIGNMENTS_CACHE_KEY, { timestamp: Date.now(), data: data });
            });

            return () => unsub();
        };

        loadAndListenAssignments();
    }, [teacherName, schoolId]);

    // 2. 📚 LOAD TOPICS (Cache-First)
    useEffect(() => {
        if (!selectedClass || !selectedSubject || !schoolId || !topicStore) {
            setTopics([]);
            setSelectedTopic(""); 
            return;
        }

        const topicId = `${schoolId}_${selectedClass}_${selectedSubject}`;
        const TOPIC_CACHE_KEY = `topics_${topicId}`;
        const topicRef = doc(schoollpq, "Topics", topicId);

        const loadAndListenTopics = async () => {
            try {
                const cachedData = await topicStore.getItem(TOPIC_CACHE_KEY);
                if (cachedData && cachedData.data) {
                    setTopics(cachedData.data.topics || []);
                }
            } catch (e) { console.error(e); }

            const unsub = onSnapshot(topicRef, (snapshot) => {
                const currentTopics = snapshot.exists() ? snapshot.data().topics || [] : [];
                setTopics(currentTopics);
                if (snapshot.exists()) {
                    topicStore.setItem(TOPIC_CACHE_KEY, { timestamp: Date.now(), data: { topics: currentTopics } });
                }
            });

            return () => unsub();
        };

        loadAndListenTopics();
    }, [selectedClass, selectedSubject, schoolId]);

    // 3. LOAD QUESTIONS (Theory Bank)
    useEffect(() => {
        if (!selectedClass || !selectedSubject || !selectedTest || !schoolId) {
            setFetchedQuestions([]);
            setExistingDocId(null);
            return;
        }
        
        const q = query(
            collection(schoollpq, "TheoryQuestionsBank"),
            where("schoolId", "==", schoolId),
            where("className", "==", selectedClass),
            where("subject", "==", selectedSubject),
            where("term", "==", selectedTest),
            where("academicYear", "==", academicYear)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docSnapshot = snapshot.docs[0];
                const docData = docSnapshot.data();
                setExistingDocId(docSnapshot.id);

                const loadedQuestions = (docData.questions || []).map((q, index) => ({
                    ...q,
                    tempId: index, 
                    number: index + 1,
                }));

                const filteredQuestions = selectedTopic 
                    ? loadedQuestions.filter(q => q.topic === selectedTopic) 
                    : loadedQuestions;
                
                setFetchedQuestions(filteredQuestions);
            } else {
                setFetchedQuestions([]);
                setExistingDocId(null);
            }
        });

        return () => unsub();
    }, [selectedClass, selectedSubject, selectedTest, schoolId, academicYear, selectedTopic]); 

    // Handlers
    const handleAddTopic = async () => {
        const newTopic = newTopicName.trim();
        if (!newTopic) return toast.error("Enter topic name");
        if (topics.some(t => t.toLowerCase() === newTopic.toLowerCase())) {
            toast.info("Topic exists");
            return setNewTopicName("");
        }

        const topicId = `${schoolId}_${selectedClass}_${selectedSubject}`;
        const topicRef = doc(schoollpq, "Topics", topicId);
        const newTopicsList = [...topics, newTopic].sort((a, b) => a.localeCompare(b));

        try {
            await setDoc(topicRef, {
                schoolId, className: selectedClass, subject: selectedSubject,
                topics: newTopicsList, timestamp: serverTimestamp(),
            }, { merge: true });
            setNewTopicName("");
            setSelectedTopic(newTopic);
            toast.success("Topic added");
        } catch (err) { toast.error("Save failed"); }
    };

    const resetForm = () => {
        setQuestions([{ number: 1, topic: "", question: "" }]);
        setEditingQuestionIndex(null);
    };

    const handleEditQuestion = (questionToEdit, index) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setQuestions([{ question: questionToEdit.question, topic: questionToEdit.topic }]);
        setSelectedTopic(questionToEdit.topic);
        setEditingQuestionIndex(index);
    };

    const handleDeleteQuestion = async (questionToDelete, index) => {
        if (!existingDocId || !window.confirm("Delete permanently?")) return;
        try {
            const docRef = doc(schoollpq, "TheoryQuestionsBank", existingDocId);
            const docSnap = await getDoc(docRef);
            const allQuestions = docSnap.data().questions || [];
            const updated = allQuestions.filter(q => 
                !(q.question === questionToDelete.question && q.topic === questionToDelete.topic)
            );
            await updateDoc(docRef, { questions: updated, timestamp: serverTimestamp() });
            if (editingQuestionIndex === index) resetForm();
            toast.success("Deleted");
        } catch (e) { toast.error("Delete failed"); }
    };

    const handleSubmitQuestions = async () => {
        const q = questions[0];
        if (!selectedTopic || !q.question.trim()) return toast.error("Topic and Question are required");

        setSubmitting(true);
        try {
            const questionToSave = { question: q.question.trim(), topic: selectedTopic };
            let allQuestions = [];
            
            if (existingDocId) {
                const docSnap = await getDoc(doc(schoollpq, "TheoryQuestionsBank", existingDocId));
                if (docSnap.exists()) allQuestions = docSnap.data().questions || [];
            }

            let finalList = [...allQuestions];
            if (editingQuestionIndex !== null) {
                const toFind = fetchedQuestions[editingQuestionIndex];
                const idx = allQuestions.findIndex(item => item.question === toFind.question && item.topic === toFind.topic);
                if (idx !== -1) finalList[idx] = questionToSave;
                else finalList.push(questionToSave);
            } else {
                finalList.push(questionToSave);
            }

            const docRef = existingDocId ? doc(schoollpq, "TheoryQuestionsBank", existingDocId) : doc(collection(schoollpq, "TheoryQuestionsBank"));

            await setDoc(docRef, {
                schoolId, className: selectedClass, subject: selectedSubject,
                term: selectedTest, academicYear, teacher: teacherName,
                questions: finalList, timestamp: serverTimestamp(),
            });

            resetForm();
            toast.success("Saved Successfully");
        } catch (e) { toast.error("Error saving"); } finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg text-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-center text-red-700 uppercase tracking-tight">
                Submit Theory Questions ({academicYear})
            </h2>

            {/* SELECTION BOX */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 border rounded-2xl bg-gray-50 shadow-sm">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => { setSelectedClass(e.target.value); setSelectedTopic(""); setSelectedSubject(""); }}
                        className="w-full border rounded-xl px-3 py-2 text-sm font-bold bg-white"
                    >
                        <option value="">Select Class</option>
                        {assignments.map((a) => <option key={a.id} value={a.className}>{a.className}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTopic(""); }}
                        className="w-full border rounded-xl px-3 py-2 text-sm font-bold bg-white disabled:bg-gray-100"
                        disabled={!selectedClass}
                    >
                        <option value="">Select Subject</option>
                        {assignments.find(a => a.className === selectedClass)?.subjects.map((s, i) => (
                            <option key={i} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Term/Test</label>
                    <select
                        value={selectedTest}
                        onChange={(e) => setSelectedTest(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-sm font-bold bg-white"
                    >
                        {tests.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* TOPIC MANAGER */}
            <div className="p-5 bg-red-50 border border-red-100 rounded-3xl mb-8">
                <h3 className="font-black text-red-800 mb-3 uppercase text-xs tracking-widest">📚 Topic Manager</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        className="flex-grow border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Add new topic..."
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        disabled={!selectedSubject}
                    />
                    <button
                        onClick={handleAddTopic}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 disabled:bg-gray-300"
                        disabled={!selectedSubject || !newTopicName.trim()}
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {topics.map((t, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded-full text-[10px] font-black uppercase">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* FORM */}
            <div className="bg-white p-6 border rounded-3xl shadow-sm mb-8">
                <div className="mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Active Topic</label>
                    <select
                        className="w-full border rounded-xl px-3 py-2 text-sm font-bold"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        <option value="">-- Choose Topic for Question --</option>
                        {topics.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                </div>

                <textarea
                    className="w-full border rounded-2xl p-4 mb-4 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                    rows="5"
                    value={questions[0].question}
                    placeholder="Type your theory question here (e.g. Describe the process of photosynthesis...)"
                    onChange={(e) => {
                        const q = [...questions];
                        q[0].question = e.target.value;
                        setQuestions(q);
                    }}
                />

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                        {editingQuestionIndex !== null && (
                            <button onClick={resetForm} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold uppercase">Cancel</button>
                        )}
                        <button
                            onClick={handleSubmitQuestions}
                            disabled={submitting || !selectedTopic || !questions[0].question.trim()}
                            className={`flex-grow sm:flex-none px-8 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-md ${
                                editingQuestionIndex !== null ? "bg-orange-500" : "bg-red-600"
                            } disabled:bg-gray-300`}
                        >
                            {submitting ? "Saving..." : editingQuestionIndex !== null ? "Update Theory" : "Submit Theory"}
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden border border-gray-100 rounded-3xl shadow-sm">
                <table className="w-full text-left text-xs">
                    <thead className="bg-gray-800 text-white uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">Topic</th>
                            <th className="p-4">Question</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {fetchedQuestions.map((q, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-400">{i + 1}</td>
                                <td className="p-4 font-bold text-red-600 uppercase text-[10px]">{q.topic}</td>
                                <td className="p-4 text-gray-700 whitespace-pre-wrap">{q.question}</td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEditQuestion(q, i)} className="text-orange-500 font-bold uppercase text-[10px]">Edit</button>
                                        <button onClick={() => handleDeleteQuestion(q, i)} className="text-red-500 font-bold uppercase text-[10px]">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {fetchedQuestions.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-gray-400 font-medium italic">No questions found for this selection.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherQuestionsPageTheory;