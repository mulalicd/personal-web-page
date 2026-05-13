import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ImageData {
  src: string;
  alt: string;
}

interface ImageLightboxProps {
  images: ImageData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate }: ImageLightboxProps) => {
  const [direction, setDirection] = useState(0);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      onNavigate(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setDirection(1);
      onNavigate(currentIndex + 1);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      goToPrevious();
    } else if (info.offset.x < -threshold && currentIndex < images.length - 1) {
      goToNext();
    }
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex]);

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence mode="wait">
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                disabled={currentIndex === 0}
                className="absolute left-4 p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                disabled={currentIndex === images.length - 1}
                className="absolute right-4 p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Image with swipe */}
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing touch-pan-y"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-muted/90 rounded-full text-sm text-foreground">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
