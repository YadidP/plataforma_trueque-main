import React, { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: number | string; name: string }[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  placeholder = 'Buscar...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id.toString() === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left flex justify-between items-center ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'
          } focus:ring-green-primary focus:border-green-primary`}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption?.name || placeholder}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:ring-green-primary"
            />
            <ul className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.id.toString());
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-green-50 ${
                        value === opt.id.toString() ? 'bg-green-100 text-green-primary font-semibold' : 'text-gray-900'
                      }`}
                    >
                      {opt.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500 text-center">No hay opciones</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;
