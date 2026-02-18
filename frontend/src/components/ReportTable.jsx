import React from "react";

const ReportTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="p-3 text-left border-b">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length ? (
            data.map((row, rIndex) => (
              <tr key={rIndex} className="odd:bg-white even:bg-gray-50">
                {columns.map((col, cIndex) => (
                  <td key={cIndex} className="p-3 border-b">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-center p-4" colSpan={columns.length}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
