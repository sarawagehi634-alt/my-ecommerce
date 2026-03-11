// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function Table({
  columns,
  data = [],
  loading = false,
  pagination,
  onRowClick,
  emptyMessage = 'لا توجد بيانات متاحة حالياً'
}) {
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">جاري جلب البيانات</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 overflow-hidden rounded-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-right py-5 px-6"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2 group">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                      {column.title}
                    </span>
                    {column.sortable && (
                      <button 
                        onClick={() => handleSort(String(column.key))}
                        className={`transition-colors ${sortConfig?.key === column.key ? 'text-black' : 'text-gray-200 group-hover:text-gray-400'}`}
                      >
                        {sortConfig?.key === column.key && sortConfig.direction === 'desc' ? <FiArrowDown size={12}/> : <FiArrowUp size={12}/>}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={`group transition-all duration-300 ${onRowClick ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
                  >
                    {columns.map((column) => (
                      <td key={String(column.key)} className="py-5 px-6 text-xs font-medium text-gray-600 group-hover:text-black">
                        {column.render ? column.render(item) : (
                           <span className="truncate block max-w-[200px]">{item[column.key]}</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-20">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold italic">{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-50 bg-white">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
            Total {pagination.totalItems.toLocaleString()} <span className="mr-1 italic text-[8px]">Entries</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
               <button 
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-10 transition-colors"
               >
                 <FiChevronRight size={18}/>
               </button>

               <div className="flex items-center px-4">
                  <span className="text-xs font-black">{pagination.currentPage}</span>
                  <span className="mx-2 text-gray-200">/</span>
                  <span className="text-xs text-gray-400">{pagination.totalPages}</span>
               </div>

               <button 
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 text-gray-400 hover:text-black disabled:opacity-10 transition-colors"
               >
                 <FiChevronLeft size={18}/>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;