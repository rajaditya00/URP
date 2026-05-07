import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (file: File) => void;
  aspectRatio?: number;
  fileName?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete, 
  aspectRatio, 
  fileName = 'cropped-image.jpg' 
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [isOpen]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop(
          { unit: '%', width: 90 },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
    } else {
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80
      });
    }
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      onCropComplete(file);
      onClose();
    }, 'image/jpeg', 0.95);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-primary rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in border border-border-color">
        <div className="flex items-center justify-between p-4 border-b border-border-color bg-bg-secondary">
          <h3 className="text-lg font-bold text-text-primary">Crop Image</h3>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full text-text-secondary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-[#f8f9fa] min-h-[300px]">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[60vh] object-contain"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 border-t border-border-color bg-bg-secondary flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md font-medium text-text-secondary hover:bg-black/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={generateCroppedImage}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="px-6 py-2 rounded-md font-medium text-white bg-accent-primary hover:bg-accent-secondary transition-colors disabled:opacity-50"
          >
            Save & Crop
          </button>
        </div>
      </div>
    </div>
  );
};
