import { Pagination } from "antd";
import React from "react";
import "./custom-pagination.css"; // Ensure the correct path

const SearchPagination = ({ activePage, totalPages, onPageChange }) => {
  return (
    <Pagination
      current={activePage}
      total={totalPages * 10} // Ant Design pagination requires total to be the total number of items, not pages
      onChange={onPageChange}
      showSizeChanger={false} // Remove the page size dropdown
      itemRender={(page, type, originalElement) => {
        if (type === "page") {
          return (
            <div
              className={`ant-pagination-item ant-pagination-item-${page} ${
                page === activePage
                  ? "ant-pagination-item-custom-active"
                  : "ant-pagination-item-custom"
              }`}
            >
              {page}
            </div>
          );
        }
        return originalElement;
      }}
    />
  );
};

export default SearchPagination;
