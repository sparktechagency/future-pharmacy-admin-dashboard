"use client";

export const useCSVDownload = () => {
  const downloadCSV = (
    data: Record<string, unknown>[],  // Changed from any to unknown
    fileName = "data.csv"
  ) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item =>
      Object.values(item)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { downloadCSV };
};