"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import usePagination from "@/hooks/usePagination";

interface PaginationComponentProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
  showInfo?: boolean;
  className?: string;
  onPageChange?: (page: number) => void;
}

function PaginationComponent({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  showInfo = true,
  className = "",
  onPageChange,
}: PaginationComponentProps) {
  const pagination = usePagination({
    totalItems,
    itemsPerPage,
    initialPage,
  });

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    getVisiblePages,
  } = pagination;

  // Call onPageChange when page changes
  React.useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between">
      {showInfo && (
        <div className="text-sm text-gray-600 font-medium text-center">
          Showing{" "}
          <span className="text-[#00705d] font-semibold">{startIndex + 1}</span>{" "}
          to{" "}
          <span className="text-[#00705d] font-semibold">{endIndex + 1}</span>{" "}
          of <span className="text-[#00705d] font-semibold">{totalItems}</span>{" "}
          results
        </div>
      )}
      <div className={`space-y-6 ${className}`}>
        {/* Results Info */}

        {/* Enhanced Pagination Controls */}
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent className="gap-2">
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    previousPage();
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 w-fit ${
                    !hasPreviousPage
                      ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400 border-gray-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[#00705d] hover:text-white hover:border-[#00705d] shadow-sm hover:shadow-md"
                  }`}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {visiblePages.map((page, index) => (
                <PaginationItem key={index}>
                  {page === -1 ? (
                    <PaginationEllipsis className="px-3 py-2 text-gray-500" />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page);
                      }}
                      isActive={currentPage === page}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
                        currentPage === page
                          ? "bg-[#00705d] text-white border-[#00705d] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    nextPage();
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 w-fit ${
                    !hasNextPage
                      ? "pointer-events-none opacity-50 bg-gray-100 text-gray-400 border-gray-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[#00705d] hover:text-white hover:border-[#00705d] shadow-sm hover:shadow-md"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

export default PaginationComponent;
