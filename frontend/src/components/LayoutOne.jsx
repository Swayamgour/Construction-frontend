import React from "react";
import { Link } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow">
        <h1 className="font-semibold tracking-wide">Construction ERP – Stock</h1>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:underline">
            Stock
          </Link>
        </nav>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
};

export default Layout;
