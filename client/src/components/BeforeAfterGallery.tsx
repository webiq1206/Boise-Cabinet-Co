import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { type GalleryPhoto } from "@shared/schema";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterGalleryProps {
  serviceType?: string;
  limit?: number;
}

export function BeforeAfterGallery({ serviceType, limit }: BeforeAfterGalleryProps) {
  const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
    queryKey: serviceType ? ['/api/gallery', serviceType] : ['/api/gallery'],
    enabled: true,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-card-border">
            <div className="aspect-[4/3] bg-muted animate-pulse" />
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded animate-pulse mb-3" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return null;
  }

  const displayPhotos = limit ? photos.slice(0, limit) : photos;

  return (
    <div className="space-y-8">
      {/* Main viewer */}
      <Card className="overflow-hidden border-card-border" data-testid="card-gallery-main">
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {/* After image */}
          <img
            src={displayPhotos[selectedPhoto].afterImageUrl}
            alt={`After - ${displayPhotos[selectedPhoto].title}`}
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="img-after"
          />
          {/* Before image with slider */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={displayPhotos[selectedPhoto].beforeImageUrl}
              alt={`Before - ${displayPhotos[selectedPhoto].title}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ width: `${100 / (sliderPosition / 100)}%` }}
              data-testid="img-before"
            />
          </div>
          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white/90 backdrop-blur-sm cursor-ew-resize touch-none z-10 shadow-xl"
            style={{ left: `${sliderPosition}%` }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const startX = e.clientX;
              const startPosition = sliderPosition;
              
              const handlePointerMove = (moveEvent: PointerEvent) => {
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (rect) {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaPercent = (deltaX / rect.width) * 100;
                  const newPosition = Math.max(0, Math.min(100, startPosition + deltaPercent));
                  setSliderPosition(newPosition);
                }
              };
              
              const handlePointerUp = (upEvent: PointerEvent) => {
                e.currentTarget.releasePointerCapture(upEvent.pointerId);
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
              };
              
              document.addEventListener('pointermove', handlePointerMove);
              document.addEventListener('pointerup', handlePointerUp);
            }}
            data-testid="slider-handle"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border border-border">
              <div className="flex gap-0.5">
                <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={2} />
                <ChevronRight className="h-4 w-4 text-foreground" strokeWidth={2} />
              </div>
            </div>
          </div>
          {/* Before/After labels */}
          <div className="absolute top-6 left-6 bg-black/75 text-white px-4 py-2 rounded-md text-sm font-medium backdrop-blur-sm" data-testid="label-before">
            Before
          </div>
          <div className="absolute top-6 right-6 bg-black/75 text-white px-4 py-2 rounded-md text-sm font-medium backdrop-blur-sm" data-testid="label-after">
            After
          </div>
        </div>
        <CardContent className="p-8">
          <h3 className="text-xl font-serif mb-3" data-testid="text-title">
            {displayPhotos[selectedPhoto].title}
          </h3>
          <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
            {displayPhotos[selectedPhoto].description}
          </p>
        </CardContent>
      </Card>

      {/* Thumbnails */}
      {displayPhotos.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => {
                setSelectedPhoto(index);
                setSliderPosition(50);
              }}
              className={`relative aspect-[4/3] rounded-md overflow-hidden transition-all border ${
                index === selectedPhoto 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'border-card-border opacity-60 hover:opacity-100 hover:border-border'
              }`}
              data-testid={`thumb-${index}`}
            >
              <img
                src={photo.afterImageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
