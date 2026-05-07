import React from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface GlorifiedImagePreviewProps {
  file: File;
  onRemove?: () => void;
  title?: string;
  className?: string;
}

export const GlorifiedImagePreview: React.FC<GlorifiedImagePreviewProps> = ({ file, onRemove, title, className = '' }) => {
  const imageUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <div className={`relative group flex items-center justify-between w-full p-2.5 bg-gradient-to-r from-emerald-50 to-green-50/30 border border-emerald-200/60 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="absolute inset-0 bg-white/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center gap-4 relative z-10 w-full overflow-hidden">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img 
            src={imageUrl} 
            alt={title || "Preview"} 
            className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg shadow-sm border border-emerald-200/80 relative z-10" 
          />
        </div>
        
        <div className="flex flex-col min-w-0 flex-1 py-1">
          <span className="text-[13px] font-bold text-emerald-800 flex items-center gap-1.5 mb-0.5">
            <CheckCircle2 size={16} className="text-emerald-500" /> 
            {title || 'Crop Saved & Ready'}
          </span>
          <span className="text-[11px] text-emerald-600/80 truncate pr-2 font-medium">
            {file.name} • {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      </div>
      
      {onRemove && (
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="relative z-10 shrink-0 p-2 text-emerald-600/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 ml-2 group/btn cursor-pointer"
          title="Remove image"
        >
          <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};
