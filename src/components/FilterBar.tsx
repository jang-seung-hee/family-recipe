import React from 'react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  search: string;
  onChange: (filters: { category: string; search: string }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  search,
  onChange,
}) => {
  return (
    <div className="flex flex-row gap-2 mb-4 bg-white rounded-xl shadow-minimal p-4 items-center">
      {/* 카테고리 */}
      <select
        className="border rounded px-3 py-2 text-minimal-blue bg-minimal-blueLight focus:outline-none flex-1"
        value={selectedCategory}
        onChange={e => onChange({ category: e.target.value, search })}
      >
        <option value="">카테고리</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {/* 검색어 */}
      <input
        type="text"
        className="border rounded px-3 py-2 flex-1 min-w-[120px] text-minimal-blue bg-minimal-blueLight focus:outline-none"
        placeholder="검색어 입력"
        value={search}
        onChange={e => onChange({ category: selectedCategory, search: e.target.value })}
      />
    </div>
  );
};

export default FilterBar; 