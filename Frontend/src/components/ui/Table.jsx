import React from 'react';

export default function Table({ 
  headers = [], 
  data = [], 
  emptyMessage = 'No data available',
  striped = true
}) {
  return (
    <div className="table-container">
      <table className={`data-table ${striped ? 'striped' : ''}`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex}>{row[header.key] || '-'}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="empty-message">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};