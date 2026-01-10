"use client";

import * as XLSX from "xlsx";

export const useDownloadXlShit = () => {
  const downloadExcel = (
    data: Record<string, unknown>[],  // Changed from any to unknown
    fileName = "data.xlsx",
    sheetName = "Sheet1"
  ) => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  return { downloadExcel };
};