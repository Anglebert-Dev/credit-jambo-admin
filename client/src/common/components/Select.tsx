import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const Select = ({ value, onChange, options, placeholder = 'Select', className = '' }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none bg-white"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                value === opt.value ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


