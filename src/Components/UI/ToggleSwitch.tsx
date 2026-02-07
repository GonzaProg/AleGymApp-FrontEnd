interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export const ToggleSwitch = ({ checked, onChange, label }: Props) => {
    return (
        <label className="inline-flex items-center cursor-pointer group">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            {label && (
                <span className="ms-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {label}
                </span>
            )}
        </label>
    );
};