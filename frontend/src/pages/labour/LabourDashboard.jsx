import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetLabourQuery } from "../../Reduxe/Api";

const LabourList = () => {
  const { data, isLoading, isError } = useGetLabourQuery();
  const navigate = useNavigate();

  const labours = data || [];

  // Grouping
  const permanentLabours = labours.filter(l => l.labourType === "Permanent Labour");
  const permanentMistri = labours.filter(l => l.labourType === "Permanent Mistri");
  const contractLabours = labours.filter(l => l.labourType === "Contract Labour");
  const contractMistri = labours.filter(l => l.labourType === "Contract Mistri");

  if (isLoading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (isError) return <div className="p-8 text-center text-red-600 text-xl">Failed to load data</div>;

  // 🌟 Labour Card Component
  const LabourCard = ({ labour }) => (
    <div
      onClick={() => navigate(`/LabourDetail/${labour._id}`)}
      className="p-5 bg-white shadow-md rounded-xl border hover:shadow-xl hover:-translate-y-1 
        transition cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">{labour.name}</h3>
        <span className="text-3xl">{labour.labourType.includes("Mistri") ? "🛠️" : "👷"}</span>
      </div>

      <p className="text-sm text-gray-500 mt-1">📞 {labour.phone}</p>

      <div className="mt-3 flex justify-between text-sm">
        <p className="font-semibold text-gray-700">
          {labour.wageType === "Daily"
            ? `₹${labour.dailyWage} / day`
            : `₹${labour.monthlySalary} / month`}
        </p>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold  
            ${labour.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {labour.status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-6">

      {/* 🔥 Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Labour Management</h1>
          <p className="text-gray-600">View and manage all labour types</p>
        </div>

        <button
          onClick={() => navigate('/LabourForm')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 
            rounded-lg shadow-md transition"
        >
          + Add New Labour
        </button>
      </div>

      {/* 📊 Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="p-6 bg-blue-100 border-l-4 border-blue-600 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-blue-800">Permanent Labour</h3>
          <p className="text-3xl font-bold mt-2">{permanentLabours.length}</p>
        </div>

        <div className="p-6 bg-indigo-100 border-l-4 border-indigo-600 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-indigo-800">Permanent Mistri</h3>
          <p className="text-3xl font-bold mt-2">{permanentMistri.length}</p>
        </div>

        <div className="p-6 bg-green-100 border-l-4 border-green-600 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-green-800">Contract Labour</h3>
          <p className="text-3xl font-bold mt-2">{contractLabours.length}</p>
        </div>

        <div className="p-6 bg-orange-100 border-l-4 border-orange-600 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-orange-800">Contract Mistri</h3>
          <p className="text-3xl font-bold mt-2">{contractMistri.length}</p>
        </div>

      </div>

      {/* ALL LABOUR */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All Labour</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {labours.length > 0 ? (
          labours.map((labour) => <LabourCard key={labour._id} labour={labour} />)
        ) : (
          <p className="text-gray-500 col-span-full">No labour found.</p>
        )}
      </div>

      {/* CATEGORY BASED LIST */}

      {/* Permanent Labour */}
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        Permanent Labour ({permanentLabours.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {permanentLabours.length > 0 ?
          permanentLabours.map(l => <LabourCard key={l._id} labour={l} />) :
          <p className="text-gray-500 col-span-full">No permanent labour found.</p>
        }
      </div>

      {/* Permanent Mistri */}
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Permanent Mistri ({permanentMistri.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {permanentMistri.length > 0 ?
          permanentMistri.map(l => <LabourCard key={l._id} labour={l} />) :
          <p className="text-gray-500 col-span-full">No permanent mistri found.</p>
        }
      </div>

      {/* Contract Labour */}
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Contract Labour ({contractLabours.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {contractLabours.length > 0 ?
          contractLabours.map(l => <LabourCard key={l._id} labour={l} />) :
          <p className="text-gray-500 col-span-full">No contract labour found.</p>
        }
      </div>

      {/* Contract Mistri */}
      <h2 className="text-2xl font-bold text-orange-700 mb-4">
        Contract Mistri ({contractMistri.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {contractMistri.length > 0 ?
          contractMistri.map(l => <LabourCard key={l._id} labour={l} />) :
          <p className="text-gray-500 col-span-full">No contract mistri found.</p>
        }
      </div>

    </div>
  );
};

export default LabourList;
