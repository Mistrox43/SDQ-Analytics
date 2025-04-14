import React, { useState, useEffect, useRef } from 'react';
import { MultiSelectProps } from '../../types';

/**
 * Custom multi-select dropdown component
 */
const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Toggle selection of an option
  const toggleOption = (option: string) => {
    const newValue = [...value];
    const index = newValue.indexOf(option);
    
    if (index === -1) {
      newValue.push(option);
    } else {
      newValue.splice(index, 1);
    }
    
    onChange(newValue);
  };
  
  // Clear all selections
  const clearSelections = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };
  
  // Select all options
  const selectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([...options]);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="flex items-center justify-between w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder || 'All'}</span>
          ) : value.length <= 2 ? (
            value.map((item, index) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {item}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(item);
                  }}
                >
                  <span className="sr-only">Remove {item}</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-700">{value.length} selected</span>
          )}
        </div>
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b flex justify-between">
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={selectAll}
            >
              Select All
            </button>
            <button
              className="text-xs text-red-600 hover:text-red-800"
              onClick={clearSelections}
            >
              Clear All
            </button>
          </div>
          <ul className="py-1 overflow-auto max-h-40" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {options.map((option, index) => {
              const isSelected = value.includes(option);
              return (
                <li
                  key={index}
                  className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <div className="mr-2 flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={isSelected}
                      onChange={() => toggleOption(option)}
                    />
                  </div>
                  <span className={isSelected ? 'font-medium text-blue-700' : ''}>
                    {option}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;