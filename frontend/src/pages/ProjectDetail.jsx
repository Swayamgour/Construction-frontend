import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tabs = ["Overview", "Vendors", "Attendance", "Finance", "Documents"];

const ProjectDetail = () => {
    const [activeTab, setActiveTab] = useState("Overview");

    // ✅ Project Info State
    const [project, setProject] = useState({
        name: "Sunrise Residency",
        location: "Pune, India",
        start: "2025-10-10",
        end: "2026-03-10",
        progress: 65,
        budget: 4500000,
        used: 2800000,
        description: "A premium residential project with modern amenities and sustainable design.",
        manager: "Rajesh Kumar",
        status: "In Progress"
    });

    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editedProject, setEditedProject] = useState({ ...project });

    // ✅ Vendors State
    const [vendors, setVendors] = useState([
        { id: 1, name: "Sharma Traders", category: "Cement", phone: "9876543210", email: "sharma@example.com", status: "Active" },
        { id: 2, name: "Metro Steel", category: "Steel", phone: "9876543211", email: "metro@example.com", status: "Active" },
    ]);
    const [newVendor, setNewVendor] = useState({ name: "", category: "", phone: "", email: "", status: "Active" });
    const [editingVendor, setEditingVendor] = useState(null);

    // ✅ Materials State
    const [materials, setMaterials] = useState([
        {
            id: 1,
            name: "Cement",
            brand: "UltraTech",
            model: "Super Cement 50kg",
            category: "Building Material",
            qty: 120,
            unitPrice: 380,
            gst: 18,
            vendorName: "ABC Traders",
            vendorContact: "9876543210",
            vendorEmail: "abc.traders@gmail.com",
            purchaseDate: "2025-10-25",
            invoiceNo: "INV-001",
            paymentStatus: "Paid",
            paymentMode: "Bank Transfer",
            location: "Warehouse A",
            remarks: "Delivered on time",
        },
        {
            id: 2,
            name: "Steel Rods",
            brand: "Tata Steel",
            model: "16mm TMT Bar",
            category: "Construction",
            qty: 80,
            unitPrice: 550,
            gst: 12,
            vendorName: "Shree Metals",
            vendorContact: "9811122233",
            vendorEmail: "sales@shreemetals.in",
            purchaseDate: "2025-10-27",
            invoiceNo: "INV-002",
            paymentStatus: "Pending",
            paymentMode: "UPI",
            location: "Warehouse B",
            remarks: "Partial payment pending",
        },
        {
            id: 3,
            name: "Bricks",
            brand: "RedClay",
            model: "Heavy Duty",
            category: "Masonry",
            qty: 2000,
            unitPrice: 8,
            gst: 5,
            vendorName: "Metro Suppliers",
            vendorContact: "9822334455",
            vendorEmail: "metro.supply@gmail.com",
            purchaseDate: "2025-10-29",
            invoiceNo: "INV-003",
            paymentStatus: "Paid",
            paymentMode: "Cash",
            location: "Site 2",
            remarks: "Used for boundary wall",
        },
        {
            id: 4,
            name: "Electrical Wire",
            brand: "Havells",
            model: "1.5mm Copper Wire",
            category: "Electrical",
            qty: 60,
            unitPrice: 750,
            gst: 18,
            vendorName: "Bright Electric Co.",
            vendorContact: "9988776655",
            vendorEmail: "contact@brightelectric.co",
            purchaseDate: "2025-11-01",
            invoiceNo: "INV-004",
            paymentStatus: "Paid",
            paymentMode: "Credit Card",
            location: "Main Warehouse",
            remarks: "Installed in Phase-1 area",
        },
        {
            id: 5,
            name: "Paint Bucket",
            brand: "Asian Paints",
            model: "Royal Gloss 20L",
            category: "Finishing Material",
            qty: 25,
            unitPrice: 1350,
            gst: 12,
            vendorName: "Color House",
            vendorContact: "8899007766",
            vendorEmail: "sales@colorhouse.in",
            purchaseDate: "2025-11-02",
            invoiceNo: "INV-005",
            paymentStatus: "Pending",
            paymentMode: "Bank Transfer",
            location: "Warehouse C",
            remarks: "Awaiting quality check",
        },
    ]);
    const [newMaterial, setNewMaterial] = useState({ name: "", category: "", qty: "", unitPrice: "", supplier: "" });
    const [editingMaterial, setEditingMaterial] = useState(null);

    // ✅ Attendance State
    const [attendance, setAttendance] = useState([
        { id: 1, date: "2025-10-31", workers: 12, progress: "5%", remarks: "Slab casting in progress" },
        { id: 2, date: "2025-11-01", workers: 15, progress: "7%", remarks: "Column work completed" },
    ]);
    const [newAttendance, setNewAttendance] = useState({ date: "", workers: "", progress: "", remarks: "" });
    const [editingAttendance, setEditingAttendance] = useState(null);

    // ✅ Finance State
    const [transactions, setTransactions] = useState([
        { id: 1, date: "2025-10-15", description: "Cement Purchase", amount: 150000, type: "Expense", category: "Materials" },
        { id: 2, date: "2025-10-20", description: "Client Payment", amount: 500000, type: "Income", category: "Payment" },
    ]);
    const [newTransaction, setNewTransaction] = useState({ date: "", description: "", amount: "", type: "Expense", category: "" });

    // ✅ Documents State
    const [documents, setDocuments] = useState([
        { id: 1, name: "Building Plan.pdf", type: "Design", uploadDate: "2025-10-01", size: "2.4 MB" },
        { id: 2, name: "Contract Agreement.doc", type: "Legal", uploadDate: "2025-10-05", size: "1.8 MB" },
    ]);
    const [newDocument, setNewDocument] = useState({ name: "", type: "", file: null });

    // -------- PROJECT CRUD FUNCTIONS ----------
    const handleProjectEdit = () => {
        setIsEditingProject(true);
        setEditedProject({ ...project });
    };

    const handleProjectSave = () => {
        setProject({ ...editedProject });
        setIsEditingProject(false);
    };

    const handleProjectCancel = () => {
        setIsEditingProject(false);
        setEditedProject({ ...project });
    };

    // -------- VENDOR CRUD FUNCTIONS ----------
    const addVendor = () => {
        if (!newVendor.name || !newVendor.category) return;
        setVendors([...vendors, { ...newVendor, id: Date.now() }]);
        setNewVendor({ name: "", category: "", phone: "", email: "", status: "Active" });
    };

    // const editVendor = (vendor) => {
    //     setEditingVendor({ ...vendor });
    // };

    const updateVendor = () => {
        if (!editingVendor.name || !editingVendor.category) return;
        setVendors(vendors.map(v => v.id === editingVendor.id ? editingVendor : v));
        setEditingVendor(null);
    };

    // const deleteVendor = (id) => {
    //     setVendors(vendors.filter((v) => v.id !== id));
    // };

    // -------- MATERIAL CRUD FUNCTIONS ----------
    const addMaterial = () => {
        if (!newMaterial.name || !newMaterial.category) return;
        setMaterials([...materials, { ...newMaterial, id: Date.now() }]);
        setNewMaterial({ name: "", category: "", qty: "", unitPrice: "", supplier: "" });
    };

    const editMaterial = (material) => {
        setEditingMaterial({ ...material });
    };

    const updateMaterial = () => {
        if (!editingMaterial.name || !editingMaterial.category) return;
        setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
        setEditingMaterial(null);
    };

    const deleteMaterial = (id) => {
        setMaterials(materials.filter((m) => m.id !== id));
    };

    // -------- ATTENDANCE CRUD FUNCTIONS ----------
    const addAttendance = () => {
        if (!newAttendance.date || !newAttendance.workers) return;
        setAttendance([...attendance, { ...newAttendance, id: Date.now() }]);
        setNewAttendance({ date: "", workers: "", progress: "", remarks: "" });
    };

    const editAttendance = (record) => {
        setEditingAttendance({ ...record });
    };

    const updateAttendance = () => {
        if (!editingAttendance.date || !editingAttendance.workers) return;
        setAttendance(attendance.map(a => a.id === editingAttendance.id ? editingAttendance : a));
        setEditingAttendance(null);
    };

    const deleteAttendance = (id) => {
        setAttendance(attendance.filter((a) => a.id !== id));
    };

    // -------- FINANCE CRUD FUNCTIONS ----------
    const addTransaction = () => {
        if (!newTransaction.date || !newTransaction.description || !newTransaction.amount) return;
        setTransactions([...transactions, { ...newTransaction, id: Date.now(), amount: parseFloat(newTransaction.amount) }]);
        setNewTransaction({ date: "", description: "", amount: "", type: "Expense", category: "" });
    };

    const deleteTransaction = (id) => {
        setTransactions(transactions.filter((t) => t.id !== id));
    };

    // -------- DOCUMENTS CRUD FUNCTIONS ----------
    const addDocument = () => {
        if (!newDocument.name || !newDocument.type) return;
        setDocuments([...documents, { ...newDocument, id: Date.now(), uploadDate: new Date().toISOString().split('T')[0], size: "1.5 MB" }]);
        setNewDocument({ name: "", type: "", file: null });
    };

    const deleteDocument = (id) => {
        setDocuments(documents.filter((d) => d.id !== id));
    };

    // Calculate financial summary
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                {/* <h1 className="text-3xl font-semibold text-gray-800">Project Details</h1> */}
                <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
                    Project Details
                </h1>
                <button onClick={() => navigate('/AddDailyUpdate')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <span>+</span>
                    <span>Add Daily Update</span>
                </button>
            </div>

            {/* Project Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Project Info</h3>
                        <button
                            onClick={handleProjectEdit}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Edit
                        </button>
                    </div>
                    {isEditingProject ? (
                        <div className="mt-3 space-y-2">
                            <input
                                type="text"
                                value={editedProject.name}
                                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                                className="w-full border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                value={editedProject.location}
                                onChange={(e) => setEditedProject({ ...editedProject, location: e.target.value })}
                                className="w-full border p-2 rounded-md text-sm"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={editedProject.start}
                                    onChange={(e) => setEditedProject({ ...editedProject, start: e.target.value })}
                                    className="w-full border p-2 rounded-md text-sm"
                                />
                                <input
                                    type="date"
                                    value={editedProject.end}
                                    onChange={(e) => setEditedProject({ ...editedProject, end: e.target.value })}
                                    className="w-full border p-2 rounded-md text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleProjectSave}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleProjectCancel}
                                    className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600"><strong>Name:</strong> {project.name}</p>
                            <p className="text-sm text-gray-600"><strong>Location:</strong> {project.location}</p>
                            <p className="text-sm text-gray-600"><strong>Start:</strong> {project.start}</p>
                            <p className="text-sm text-gray-600"><strong>End:</strong> {project.end}</p>
                            <p className="text-sm text-gray-600"><strong>Manager:</strong> {project.manager}</p>
                            <p className="text-sm text-gray-600"><strong>Status:</strong> {project.status}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
                    <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{project.progress}% Complete</p>
                    <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">Budget</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">₹ {project.budget.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Used: ₹ {project.used.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Remaining: ₹ {(project.budget - project.used).toLocaleString()}</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(project.used / project.budget) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-blue-50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* OVERVIEW TAB */}
                {activeTab === "Overview" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quick Stats */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700">Quick Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div onClick={() => setActiveTab('Vendors')} className="bg-blue-50 p-4 rounded-lg cursor-pointer">
                                        <p className="text-2xl font-bold text-blue-600">{vendors.length}</p>
                                        <p className="text-sm text-gray-600">Vendors</p>
                                    </div>
                                    <div onClick={() => setActiveTab('Materials')} className="bg-green-50 p-4 rounded-lg cursor-pointer">
                                        <p className="text-2xl font-bold text-green-600">{materials.length}</p>
                                        <p className="text-sm text-gray-600">Materials</p>
                                    </div>
                                    <div onClick={() => setActiveTab('Attendance')} className="bg-yellow-50 p-4 rounded-lg cursor-pointer
                                    ">
                                        <p className="text-2xl font-bold text-yellow-600">{attendance.length}</p>
                                        <p className="text-sm text-gray-600">Attendance Records</p>
                                    </div>
                                    <div onClick={() => setActiveTab('Documents')} className="bg-purple-50 p-4 rounded-lg cursor-pointer">
                                        <p className="text-2xl font-bold text-purple-600">{documents.length}</p>
                                        <p className="text-sm text-gray-600">Documents</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Activity</h3>
                                <div className="space-y-3">
                                    {attendance.slice(-3).map((record) => (
                                        <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div>
                                                <p className="text-sm font-medium">{record.date}</p>
                                                <p className="text-xs text-gray-600">{record.remarks}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Project Timeline */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Project Timeline</h3>
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                <div className="text-center">
                                    <p className="text-sm font-semibold">Start Date</p>
                                    <p className="text-lg text-blue-600">{project.start}</p>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold">End Date</p>
                                    <p className="text-lg text-red-600">{project.end}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VENDORS TAB */}
                {activeTab === "Vendors" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Vendors</h2>
                            <button
                                onClick={addVendor}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
                            >
                                <span>+</span>
                                <span>Add Vendor</span>
                            </button>
                        </div>

                        {/* Add Vendor Form */}
                        <div className="grid md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Vendor Name"
                                value={newVendor.name}
                                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={newVendor.category}
                                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={newVendor.phone}
                                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newVendor.email}
                                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <button
                                onClick={addVendor}
                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm"
                            >
                                Add Vendor
                            </button>
                        </div>

                        {/* Edit Vendor Modal */}
                        {editingVendor && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg w-96">
                                    <h3 className="text-lg font-semibold mb-4">Edit Vendor</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Vendor Name"
                                            value={editingVendor.name}
                                            onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Category"
                                            value={editingVendor.category}
                                            onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone"
                                            value={editingVendor.phone}
                                            onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={editingVendor.email}
                                            onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <select
                                            value={editingVendor.status}
                                            onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={updateVendor}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex-1"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => setEditingVendor(null)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vendors Table */}
                        {/* <div className="relative overflow-x-auto max-w-2/4">
                            <div className="min-w-max">
                                <table className="border-collapse text-sm w-auto"> */}

                        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto max-w-6xl">
                            <table className="min-w-[1600px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 text-left whitespace-nowrap">
                                        <th className="p-3 border">#</th>
                                        <th className="p-3 border">Product Name</th>
                                        <th className="p-3 border">Brand</th>
                                        <th className="p-3 border">Model / Specification</th>
                                        <th className="p-3 border">Category</th>
                                        <th className="p-3 border text-center">Quantity (pcs)</th>
                                        <th className="p-3 border text-center">Unit Price (₹)</th>
                                        <th className="p-3 border text-center">GST (%)</th>
                                        <th className="p-3 border text-center">Total (₹)</th>
                                        <th className="p-3 border text-center">Total (with GST)</th>
                                        <th className="p-3 border">Vendor Name</th>
                                        <th className="p-3 border">Vendor Contact</th>
                                        <th className="p-3 border">Supplier Email</th>
                                        <th className="p-3 border">Purchase Date</th>
                                        <th className="p-3 border">Invoice No</th>
                                        <th className="p-3 border">Payment Status</th>
                                        <th className="p-3 border">Payment Mode</th>
                                        <th className="p-3 border">Warehouse / Location</th>
                                        <th className="p-3 border">Remarks</th>
                                        <th className="p-3 border text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {materials.map((m, index) => {
                                        const total = Number(m.qty) * Number(m.unitPrice);
                                        const gstAmount = (total * (Number(m.gst) || 0)) / 100;
                                        const totalWithGst = total + gstAmount;

                                        return (
                                            <tr key={m.id} className="border-b hover:bg-gray-50 whitespace-nowrap">
                                                <td className="p-3 border text-center">{index + 1}</td>
                                                <td className="p-3 border">{m.name}</td>
                                                <td className="p-3 border">{m.brand || "—"}</td>
                                                <td className="p-3 border">{m.model || "—"}</td>
                                                <td className="p-3 border">{m.category}</td>
                                                <td className="p-3 border text-center">{m.qty} pcs</td>
                                                <td className="p-3 border text-center">₹ {m.unitPrice}</td>
                                                <td className="p-3 border text-center">{m.gst || 0}%</td>
                                                <td className="p-3 border text-center font-semibold text-gray-700">
                                                    ₹ {total.toFixed(2)}
                                                </td>
                                                <td className="p-3 border text-center font-semibold text-green-700">
                                                    ₹ {totalWithGst.toFixed(2)}
                                                </td>
                                                <td className="p-3 border">{m.vendorName}</td>
                                                <td className="p-3 border">{m.vendorContact}</td>
                                                <td className="p-3 border">{m.vendorEmail || "—"}</td>
                                                <td className="p-3 border">{m.purchaseDate}</td>
                                                <td className="p-3 border">{m.invoiceNo || "—"}</td>
                                                <td
                                                    className={`p-3 border font-medium ${m.paymentStatus === "Paid"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}
                                                >
                                                    {m.paymentStatus || "Pending"}
                                                </td>
                                                <td className="p-3 border">{m.paymentMode || "—"}</td>
                                                <td className="p-3 border">{m.location || "Main Warehouse"}</td>
                                                <td className="p-3 border text-gray-600">{m.remarks || "—"}</td>
                                                <td className="p-3 border text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => editMaterial(m)}
                                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMaterial(m.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot>
                                    <tr className="bg-gray-100 font-semibold text-gray-800 whitespace-nowrap">
                                        <td colSpan="8" className="p-3 border text-right">
                                            Grand Total:
                                        </td>
                                        <td className="p-3 border text-green-700 text-center">
                                            ₹{" "}
                                            {materials
                                                .reduce(
                                                    (acc, item) =>
                                                        acc +
                                                        Number(item.qty) *
                                                        Number(item.unitPrice) *
                                                        (1 + (Number(item.gst) || 0) / 100),
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                        <td colSpan="10" className="p-3 border"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>





                    </div>
                )}

                {/* MATERIALS TAB */}
                {activeTab === "Materials" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Materials Used</h2>

                        {/* Add Material Form */}
                        <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Material Name"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={newMaterial.category}
                                onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Quantity"
                                value={newMaterial.qty}
                                onChange={(e) => setNewMaterial({ ...newMaterial, qty: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <button
                                onClick={addMaterial}
                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm"
                            >
                                Add Material
                            </button>
                        </div>

                        {/* Edit Material Modal */}
                        {editingMaterial && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg w-96">
                                    <h3 className="text-lg font-semibold mb-4">Edit Material</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Material Name"
                                            value={editingMaterial.name}
                                            onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Category"
                                            value={editingMaterial.category}
                                            onChange={(e) => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Quantity"
                                            value={editingMaterial.qty}
                                            onChange={(e) => setEditingMaterial({ ...editingMaterial, qty: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit Price"
                                            value={editingMaterial.unitPrice}
                                            onChange={(e) => setEditingMaterial({ ...editingMaterial, unitPrice: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={updateMaterial}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex-1"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => setEditingMaterial(null)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Materials Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">Name</th>
                                        <th className="p-3 border">Category</th>
                                        <th className="p-3 border">Quantity</th>
                                        <th className="p-3 border">Unit Price</th>
                                        <th className="p-3 border">Supplier</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map((m) => (
                                        <tr key={m.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border">{m.name}</td>
                                            <td className="p-3 border">{m.category}</td>
                                            <td className="p-3 border">{m.qty}</td>
                                            <td className="p-3 border">₹ {m.unitPrice}</td>
                                            <td className="p-3 border">{m.supplier}</td>
                                            <td className="p-3 border">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editMaterial(m)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMaterial(m.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ATTENDANCE TAB */}
                {activeTab === "Attendance" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Daily Attendance</h2>

                        {/* Add Attendance Form */}
                        <div className="grid md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="date"
                                value={newAttendance.date}
                                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Workers"
                                value={newAttendance.workers}
                                onChange={(e) => setNewAttendance({ ...newAttendance, workers: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Progress %"
                                value={newAttendance.progress}
                                onChange={(e) => setNewAttendance({ ...newAttendance, progress: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Remarks"
                                value={newAttendance.remarks}
                                onChange={(e) => setNewAttendance({ ...newAttendance, remarks: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <button
                                onClick={addAttendance}
                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm"
                            >
                                Add Record
                            </button>
                        </div>

                        {/* Edit Attendance Modal */}
                        {editingAttendance && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg w-96">
                                    <h3 className="text-lg font-semibold mb-4">Edit Attendance</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="date"
                                            value={editingAttendance.date}
                                            onChange={(e) => setEditingAttendance({ ...editingAttendance, date: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Workers"
                                            value={editingAttendance.workers}
                                            onChange={(e) => setEditingAttendance({ ...editingAttendance, workers: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Progress %"
                                            value={editingAttendance.progress}
                                            onChange={(e) => setEditingAttendance({ ...editingAttendance, progress: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Remarks"
                                            value={editingAttendance.remarks}
                                            onChange={(e) => setEditingAttendance({ ...editingAttendance, remarks: e.target.value })}
                                            className="w-full border p-2 rounded-md"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={updateAttendance}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex-1"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => setEditingAttendance(null)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">Date</th>
                                        <th className="p-3 border">Workers</th>
                                        <th className="p-3 border">Progress</th>
                                        <th className="p-3 border">Remarks</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((a) => (
                                        <tr key={a.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border">{a.date}</td>
                                            <td className="p-3 border">{a.workers}</td>
                                            <td className="p-3 border">{a.progress}</td>
                                            <td className="p-3 border">{a.remarks}</td>
                                            <td className="p-3 border">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editAttendance(a)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAttendance(a.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* FINANCE TAB */}
                {activeTab === "Finance" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Financial Management</h2>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
                                <p className="text-2xl font-bold text-green-600">₹ {totalIncome.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
                                <p className="text-2xl font-bold text-red-600">₹ {totalExpenses.toLocaleString()}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                <h3 className={`text-lg font-semibold ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                                    Balance
                                </h3>
                                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    ₹ {balance.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Add Transaction Form */}
                        <div className="grid md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="date"
                                value={newTransaction.date}
                                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newTransaction.description}
                                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <select
                                value={newTransaction.type}
                                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            >
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>
                            <button
                                onClick={addTransaction}
                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm"
                            >
                                Add Transaction
                            </button>
                        </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">Date</th>
                                        <th className="p-3 border">Description</th>
                                        <th className="p-3 border">Amount</th>
                                        <th className="p-3 border">Type</th>
                                        <th className="p-3 border">Category</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border">{t.date}</td>
                                            <td className="p-3 border">{t.description}</td>
                                            <td className="p-3 border">
                                                <span className={t.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                                                    ₹ {t.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-3 border">
                                                <span className={`px-2 py-1 rounded-full text-xs ${t.type === 'Income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="p-3 border">{t.category}</td>
                                            <td className="p-3 border">
                                                <button
                                                    onClick={() => deleteTransaction(t.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DOCUMENTS TAB */}
                {activeTab === "Documents" && (
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Project Documents</h2>

                        {/* Add Document Form */}
                        <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Document Name"
                                value={newDocument.name}
                                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <select
                                value={newDocument.type}
                                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                                className="border p-2 rounded-md text-sm"
                            >
                                <option value="">Select Type</option>
                                <option value="Design">Design</option>
                                <option value="Legal">Legal</option>
                                <option value="Financial">Financial</option>
                                <option value="Technical">Technical</option>
                            </select>
                            <input
                                type="file"
                                onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                                className="border p-2 rounded-md text-sm"
                            />
                            <button
                                onClick={addDocument}
                                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm"
                            >
                                Upload Document
                            </button>
                        </div>

                        {/* Documents Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">Document Name</th>
                                        <th className="p-3 border">Type</th>
                                        <th className="p-3 border">Upload Date</th>
                                        <th className="p-3 border">Size</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((d) => (
                                        <tr key={d.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 border">{d.name}</td>
                                            <td className="p-3 border">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {d.type}
                                                </span>
                                            </td>
                                            <td className="p-3 border">{d.uploadDate}</td>
                                            <td className="p-3 border">{d.size}</td>
                                            <td className="p-3 border">
                                                <div className="flex gap-2">
                                                    <button className="text-blue-500 hover:text-blue-700 text-sm">
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => deleteDocument(d.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProjectDetail;