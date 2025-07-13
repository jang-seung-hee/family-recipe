import React from 'react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ current, total, onChange }) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {pages.map(page => (
        <button
          key={page}
          className={`px-3 py-1 rounded-lg border text-sm font-bold transition-colors duration-150 ${page === current ? 'bg-minimal-blue text-white' : 'bg-white text-minimal-blue border-minimal-blue'}`}
          onClick={() => onChange(page)}
          disabled={page === current}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination; 