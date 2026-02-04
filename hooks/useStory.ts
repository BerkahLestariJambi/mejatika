import { useState, useCallback } from 'react';

export const useStory = (initialSlides = []) => {
  const [slides, setSlides] = useState<any[]>(initialSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(-1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addSlide = useCallback((targetId: string = "") => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      title: "Judul Materi Baru",
      desc: "Tuliskan penjelasan detail mengenai aset ini di sini...",
      targetId: targetId
    };
    setSlides((prev) => [...prev, newSlide]);
  }, []);

  const updateSlide = useCallback((id: string, updates: any) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const removeSlide = useCallback((id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    slides,
    setSlides,
    activeSlideIndex,
    setActiveSlideIndex,
    isPreviewMode,
    setIsPreviewMode,
    addSlide,
    updateSlide,
    removeSlide
  };
};
