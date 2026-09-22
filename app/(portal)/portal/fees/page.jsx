"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function PupilFeesPage() {
  const router = useRouter();
  const { user } = useAuth();

  // If user not ready yet
  if (!user) return <p className="p-6 text-center">Loading...</p>;

  // Extract pupil data
  const pupil = user?.role === "pupil" ? user.data : null;
  if (!pupil) return <p className="p-6 text-center">No pupil data found.</p>;

  const [fees, setFees] = useState([]);
  const [uniqueYears, setUniqueYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredFees, setFilteredFees] = useState([]);

  // ---------------------------------------------------
  // 🔥 REAL-TIME LISTENER FOR PUPIL'S FEE INFO
  // ---------------------------------------------------
  useEffect(() => {
    if (!pupil?.studentID) {
      router.replace("/");
      return;
    }

    const q = query(
      collection(db, "Receipts"),
      where("studentID", "==", pupil.studentID)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveFees = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFees(liveFees);

        if (liveFees.length > 0) {
          const years = [
            ...new Set(liveFees.map((fee) => fee.academicYear)),
          ]
            .sort()
            .reverse();

          setUniqueYears(years);
          if (!selectedYear) setSelectedYear(years[0] || "");
        } else {
          setUniqueYears([]);
          setSelectedYear("");
        }
      },
      (err) => console.log("Error loading fee data:", err)
    );

    return () => unsubscribe();
  }, [pupil, router, selectedYear]);

  // ---------------------------------------------------
  // 🎯 FILTER FEES BY YEAR
  // ---------------------------------------------------
  useEffect(() => {
    if (selectedYear) {
      setFilteredFees(
        fees.filter((fee) => fee.academicYear === selectedYear)
      );
    } else {
      setFilteredFees([]);
    }
  }, [selectedYear, fees]);

  // Totals
  const totalCharged = filteredFees.reduce(
    (sum, fee) => sum + (parseFloat(fee.amount || 0) + parseFloat(fee.balance || 0)),
    0
  );

  const totalPaid = filteredFees.reduce(
    (sum, fee) => sum + parseFloat(fee.amount || 0),
    0
  );

  const totalBalance = filteredFees.reduce(
    (sum, fee) => sum + parseFloat(fee.balance || 0),
    0
  );

  // ---------------------------------------------------
  // MOBILE ROW COMPONENT
  // ---------------------------------------------------
  const FeeRowMobile = ({ fee }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 space-y-2 mb-4">
      <div className="flex justify-between items-center border-b pb-2">
        <span className="text-lg font-bold text-indigo-700">{fee.feeType}</span>
        <span className="text-sm font-medium text-gray-500">{fee.class}</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div>Fees:</div>
        <div className="text-right font-bold">
          NLE {((fee.amount || 0) + (fee.balance || 0)).toFixed(2)}
        </div>

        <div>Paid:</div>
        <div className="text-right text-green-600 font-bold">
          NLE {(fee.amount || 0).toFixed(2)}
        </div>

        <div>Balance:</div>
        <div className="text-right text-red-600 font-bold">
          NLE {(fee.balance || 0).toFixed(2)}
        </div>

        <div>Date:</div>
        <div className="text-right">{fee.paymentDate}</div>

        <div>Method:</div>
        <div className="text-right">{fee.paymentMethod}</div>

        <div className="col-span-2 text-xs text-gray-500 border-t pt-2">
          Receipt ID: <span className="font-mono">{fee.receiptId}</span>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <h1 className="text-3xl font-extrabold text-indigo-700 text-center mb-6">
        Pupil Fee Account
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Pupil Information */}
        <div className="bg-white shadow-xl rounded-2xl p-6 flex gap-6 border-t-4 border-indigo-500">
          <img
            src={pupil.userPhotoUrl}
            alt={pupil.studentName}
            className="w-28 h-28 rounded-full border-4 border-indigo-200 object-cover"
            onError={(e) => {
              e.target.src = `https://placehold.co/100x100/5057A6/ffffff?text=${pupil.studentName.charAt(
                0
              )}`;
            }}
          />

          <div>
            <h2 className="text-2xl font-bold">{pupil.studentName}</h2>
            <p>ID: <span className="font-medium">{pupil.studentID}</span></p>
            <p className="font-semibold mt-1">
              Class: {pupil.class} | Year: {pupil.academicYear}
            </p>
            <p className="text-sm mt-1">
              Parent: {pupil.parentName} | Phone: {pupil.parentPhone}
            </p>
          </div>
        </div>

        {/* Year Select */}
        {fees.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
            <label className="text-lg font-semibold">Academic Year:</label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border p-2 rounded-lg focus:ring-indigo-500"
            >
              {uniqueYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {/* Fee List Section */}
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Fee Line Items</h3>

          {/* Mobile View */}
          <div className="sm:hidden">
            {filteredFees.length > 0 ? (
              filteredFees.map((fee) => (
                <FeeRowMobile key={fee.id} fee={fee} />
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">
                No records found for {selectedYear}.
              </p>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-50 text-indigo-700">
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Fee Type</th>
                  <th className="p-3 text-right">Fees</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Receipt ID</th>
                </tr>
              </thead>

              <tbody>
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="border-b">
                    <td className="p-3">{fee.class}</td>
                    <td className="p-3">{fee.feeType}</td>
                    <td className="p-3 text-right">
                      {((fee.amount || 0) + (fee.balance || 0)).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-green-600">
                      {(fee.amount || 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {(fee.balance || 0).toFixed(2)}
                    </td>
                    <td className="p-3">{fee.paymentDate}</td>
                    <td className="p-3">{fee.paymentMethod}</td>
                    <td className="p-3 text-xs text-gray-600">{fee.receiptId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
