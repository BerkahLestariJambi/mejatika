// src/components/story-designer/Player.tsx
import React, { useState, useEffect } from 'react';

export default function Player({ activeSlide, onNext, totalSlides }: any) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!activeSlide) return;

    let currentText = activeSlide.desc;
    let index = 0;
    setDisplayText("");
    setIsTyping(true);

    const timer = setInterval(() => {
      setDisplayText((prev) => prev + currentText.charAt(index));
      index++;

      if (index >= currentText.length) {
        clearInterval(timer);
        setIsTyping(false);
        // Tunggu 3 detik setelah bicara selesai, lalu lanjut slide berikutnya
        setTimeout(() => {
          if (activeSlide.index < totalSlides - 1) onNext();
        }, 3000);
      }
    }, 50); // Kecepatan ngetik teks

    return () => clearInterval(timer);
  }, [activeSlide, onNext]);

  return (
    <div className="absolute bottom-10 inset-x-0 flex justify-center z-[100] pointer-events-none">
      <div className="bg-white shadow-2xl rounded-[30px] p-8 w-full max-w-4xl border-t-4 border-orange-500 pointer-events-auto">
        <h3 className="text-orange-500 font-black mb-2 uppercase tracking-widest text-xs">
          {activeSlide.title}
        </h3>
        {/* Teks yang sedang berjalan */}
        <p className="text-2xl font-medium text-slate-800 leading-relaxed italic">
          "{displayText}"<span className={isTyping ? "animate-pulse" : "hidden"}>|</span>
        </p>
      </div>
    </div>
  );
}
