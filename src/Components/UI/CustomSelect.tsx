import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppStyles } from '../../Styles/AppStyles';

export interface CustomSelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: CustomSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchable?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    searchable = false,
    icon,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Click outside listener for desktop
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm, searchable]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {/* OVERLAY INVISIBLE PARA MÓVILES */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[90] sm:hidden" 
                    onClick={() => setIsOpen(false)}
                    onTouchStart={(e) => { e.preventDefault(); setIsOpen(false); }}
                />
            )}

            <div 
                className="relative cursor-pointer z-[95]"
                onClick={() => {
                    if (!searchable) setIsOpen(!isOpen);
                }}
            >
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none flex items-center justify-center">
                        {icon}
                    </div>
                )}
                
                {searchable ? (
                    <input 
                        type="text" 
                        placeholder={placeholder}
                        value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
                        onFocus={() => {
                            setIsOpen(true);
                            setSearchTerm('');
                        }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${AppStyles.inputDark} w-full relative z-[100] ${icon ? 'pl-10' : ''} pr-10`}
                    />
                ) : (
                    <div 
                        className={`${AppStyles.inputDark} w-full relative z-[100] flex items-center justify-between ${icon ? 'pl-10' : ''} pr-10 select-none min-h-[46px]`}
                    >
                        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                )}

                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-[101] transition-transform duration-300 pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 max-h-52 overflow-y-auto scrollbar-none bg-gray-950 border border-white/20 rounded-xl shadow-2xl touch-pan-y animate-fade-in origin-top">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div 
                                key={opt.value} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    if (searchable) setSearchTerm('');
                                }}
                                className={`px-3 py-2.5 text-sm flex items-center gap-3 border-b border-white/5 last:border-0 cursor-pointer transition-colors select-none ${
                                    value === opt.value ? 'bg-orange-500/20 text-orange-400' : 'text-white active:bg-orange-500/40 hover:bg-orange-500/20'
                                }`}
                            >
                                {opt.icon && <span className="text-gray-400">{opt.icon}</span>}
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-gray-500 text-sm text-center italic">No se encontraron resultados</div>
                    )}
                </div>
            )}
        </div>
    );
};
