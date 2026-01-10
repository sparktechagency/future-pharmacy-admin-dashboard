"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useDownloadPDF = () => {
  const downloadPDF = (
    data: Record<string, unknown>[],  // Changed from any to unknown
    fileName = "data.pdf",
    title = "Data List"
  ) => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();

    doc.text(title, 14, 15);

    const headers = Object.keys(data[0]);
    const body = data.map(item => headers.map(key => {
      const value = item[key];
      return value !== null && value !== undefined ? String(value) : '';
    }));

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body,
    });

    doc.save(fileName);
  };

  return { downloadPDF };
};