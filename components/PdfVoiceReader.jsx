"use client";

import React, { useState, ChangeEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Worker CDN untuk membongkar file PDF
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfVoiceReader(): React.JSX.Element {
  const [isReading, setIsReading] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fungsi membaca file PDF langsung dari input browser
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Pilih file PDF yang valid!");
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Ekstraksi teks per halaman PDF
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        fullText += pageText + " ";
      }

      const cleanText = fullText.trim();
      setExtractedText(cleanText);
      
      if (cleanText) {
        speakText(cleanText);
      } else {
        alert("File PDF ini tidak mengandung teks (mungkinan berupa gambar/scan).");
      }
    } catch (err) {
      console.error("Gagal membaca file PDF:", err);
      alert("Terjadi kesalahan saat mengekstrak teks PDF.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Text-to-Speech Web Speech API
  const speakText = (text: string): void => {
    if (!("speechSynthesis" in window)) {
      alert("Browser kamu tidak mendukung fitur pembacaan suara.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop suara yang sedang diputar jika ada

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID"; // Bahasa Indonesia
    utterance.rate = 0.9;     // Kecepatan membaca (0.1 - 10)

    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopVoice = (): void => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm max-w-md">
      <h3 className="font-bold text-base mb-3">Baca Voice dari File PDF</h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={loading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3 disabled:opacity-50"
      />

      {loading && <p className="text-xs text-blue-600 mb-2">Mengekstrak teks PDF...</p>}

      {isReading && (
        <button
          onClick={stopVoice}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
        >
          ⏹ Stop Suara
        </button>
      )}

      {extractedText && (
        <div className="mt-3 p-2 bg-gray-50 border rounded text-xs max-h-32 overflow-y-auto">
          <strong>Teks Terbaca:</strong>
          <p className="mt-1 text-gray-600">{extractedText}</p>
        </div>
      )}
    </div>
  );
}
