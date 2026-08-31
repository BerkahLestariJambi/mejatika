"use client"

import { useState, useRef, useEffect } from "react"
import * as pdfjsLib from "pdfjs-dist"

interface RecordingHistory {
  id: string;
  blob: Blob;
  url: string;
  timestamp: string;
  uploadStatus?: "idle" | "uploading" | "success" | "error"
}
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = String(
    "/pdf.worker.min.mjs"
  );
}

interface ExtractedSlideData {
  title: string;
  subtitle: string;
  bullets: string[];
}

// Fitur Tema Latar Belakang Presentasi untuk Mode Animasi Teks
interface StudioTheme {
  id: string;
  name: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  accentColor: string;
  textColor: string;
  subtitleColor: string;
  bulletColor: string;
  customImage?: HTMLImageElement | null; // Untuk menyimpan element gambar yang di-upload
}

const STUDIO_THEMES: StudioTheme[] = [
  { id: "dark-indigo", name: "Default Indigo", bgGradientStart: "#0f172a", bgGradientEnd: "#1e1b4b", accentColor: "#3b82f6", textColor: "#ffffff", subtitleColor: "#94a3b8", bulletColor: "#e2e8f0" },
  { id: "elegant-blue", name: "Elegant Blue", bgGradientStart: "#0a192f", bgGradientEnd: "#172a45", accentColor: "#64ffda", textColor: "#f8fafc", subtitleColor: "#8892b0", bulletColor: "#ccd6f6" },
  { id: "emerald-garden", name: "Emerald Garden", bgGradientStart: "#064e3b", bgGradientEnd: "#022c22", accentColor: "#34d399", textColor: "#f0fdf4", subtitleColor: "#a7f3d0", bulletColor: "#e6f4ea" },
  { id: "warm-charcoal", name: "Warm Charcoal", bgGradientStart: "#1c1917", bgGradientEnd: "#292524", accentColor: "#f59e0b", textColor: "#fafaf9", subtitleColor: "#a8a29e", bulletColor: "#e7e5e4" }
];

const DB_NAME = "StudioPresenterDB";
const STORE_NAME = "recordings";
const DB_VERSION = 1;
const BACKEND_URL = "https://backend.mejatika.com/api/upload";

export default function StudioHybridPresenter() {
  const [recording, setRecording] = useState(false);
  const [recordingsList, setRecordingsList] = useState<RecordingHistory[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  
  // Pilihan Mode Sumber Materi: 'pdf', 'screen', atau 'pdf-animation'
  const [sourceMode, setSourceMode] = useState<'pdf' | 'screen' | 'pdf-animation'>('pdf');
  
  // State Tema Studio Aktif
  const [activeTheme, setActiveTheme] = useState<StudioTheme>(STUDIO_THEMES[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  // State Kamera Utama
  const [isCamOn, setIsCamOn] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  // State MODE PDF Asli & Animasi Cache
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const slideCanvasCache = useRef<HTMLCanvasElement | null>(null);
  const slideAnimId = useRef<number | null>(null);

  // State MODE PDF ANIMASI (Ekstrak Teks Otomatis)
  const [animatedSlides, setAnimatedSlides] = useState<ExtractedSlideData[]>([
    {
      title: "Silakan Unggah PDF Anda",
      subtitle: "Teks akan otomatis diekstrak menjadi animasi studio",
      bullets: ["1. Unggah file PDF di panel kanan", "2. Sistem memindai teks dokumen", "3. Pilih Mode Teks untuk melihat hasil animasi"]
    }
  ]);
  const [textSlideIndex, setTextSlideIndex] = useState<number>(0);
  const textAnimProgress = useRef<number>(0);

  // State MODE SHARE SCREEN
  const [isSharing, setIsSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // State Papan Tulis Digital
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor] = useState("#ef4444");
  const [penWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // State Toolbar
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  // Posisi Elemen Melayang
  const [wbPos, setWbPos] = useState({ x: 50, y: 120, w: 560, h: 360 });
  const [isDraggingWb, setIsDraggingWb] = useState(false);
  const [camPos, setCamPos] = useState({ x: 980, y: 500 });
  const [isDraggingCam, setIsDraggingCam] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });

  // Refs Canvas Rekaman & Media
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameContainerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const wbPosRef = useRef(wbPos);
  const camPosRef = useRef(camPos);
  useEffect(() => { wbPosRef.current = wbPos; }, [wbPos]);
  useEffect(() => { camPosRef.current = camPos; }, [camPos]);

  // Trigger Animasi Setiap Kali Slide Teks Berpindah
  const triggerTextAnimation = () => {
    textAnimProgress.current = 0;
  };

  useEffect(() => {
    if (sourceMode === 'pdf-animation') {
      triggerTextAnimation();
    }
  }, [textSlideIndex, animatedSlides, sourceMode]);

  // Inisialisasi Cache PDF, Screen Element, & Load Awal Data IndexedDB
  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      slideCanvasCache.current = document.createElement("canvas");
      screenVideoRef.current = document.createElement("video");
      screenVideoRef.current.autoplay = true;
      screenVideoRef.current.playsInline = true;
      screenVideoRef.current.muted = true;
      
      pdfCanvasRef.current = document.createElement("canvas");

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const items = getAllRequest.result || [];
          const formattedItems = items.map((item: any) => ({
            id: item.id, blob: item.blob, url: URL.createObjectURL(item.blob), timestamp: item.timestamp, uploadStatus: "idle" as const,
          }));
          setRecordingsList(formattedItems.sort((a: any, b: any) => b.id.localeCompare(a.id)));
        };
      };
    }
  }, []);

  // ==========================================
  // WEBCAM STREAM & DEVICE DETECTION LOGIC
  // ==========================================
  useEffect(() => {
    const initDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(cameras);

        const droidCam = cameras.find((d) => d.label.toLowerCase().includes("droid"));
        if (droidCam) {
          setSelectedCamera(droidCam.deviceId);
          startCamera(droidCam.deviceId);
        } else if (cameras[0]) {
          setSelectedCamera(cameras[0].deviceId);
          startCamera(cameras[0].deviceId);
        }
      } catch (err) {
        console.error("Gagal inisialisasi perangkat:", err);
      }
    };

    initDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCamOn && streamRef.current && webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = streamRef.current;
      webcamVideoRef.current.play().catch(() => {});
    }
  }, [isCamOn]);

  const toggleCamera = () => {
    if (!isCamOn) {
      startCamera(selectedCamera);
    } else if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setIsCamOn(false);
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        await webcamVideoRef.current.play();
        console.log("Camera Settings:", stream.getVideoTracks()[0].getSettings());
      }
      setIsCamOn(true);
    } catch (err) {
      console.error("Gagal membuka kamera:", err);
      setIsCamOn(false);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (isCamOn) {
      startCamera(deviceId);
    }
  };

  // ==========================================
  // LOGIC RENDER FILE PDF ASLI (DENGAN ANIMASI FADE)
  // ==========================================
  useEffect(() => {
    if (!pdfDoc || sourceMode !== 'pdf') return;

    pdfDoc.getPage(currentSlide).then((page: any) => {
      const hiddenPdfCanvas = pdfCanvasRef.current;
      const cacheCanvas = slideCanvasCache.current;
      if (!hiddenPdfCanvas || !cacheCanvas) return;

      const pdfCtx = hiddenPdfCanvas.getContext("2d");
      const cacheCtx = cacheCanvas.getContext("2d");
      if (!pdfCtx || !cacheCtx) return;

      const viewport = page.getViewport({ scale: 1.5 });
      hiddenPdfCanvas.width = viewport.width;
      hiddenPdfCanvas.height = viewport.height;
      cacheCanvas.width = viewport.width;
      cacheCanvas.height = viewport.height;

      page.render({ canvasContext: cacheCtx, viewport }).promise.then(() => {
        if (slideAnimId.current) cancelAnimationFrame(slideAnimId.current);
        
        let opacity = 0;
        const animateSlide = () => {
          opacity += 0.08;
          if (opacity > 1) opacity = 1;

          pdfCtx.clearRect(0, 0, hiddenPdfCanvas.width, hiddenPdfCanvas.height);
          pdfCtx.globalAlpha = opacity;
          pdfCtx.drawImage(cacheCanvas, 0, 0);

          if (opacity < 1) {
            slideAnimId.current = requestAnimationFrame(animateSlide);
          }
        };
        animateSlide();
      });
    });

    return () => {
      if (slideAnimId.current) cancelAnimationFrame(slideAnimId.current);
    };
  }, [pdfDoc, currentSlide, sourceMode]);

  // ==========================================
  // LOGIC SHARE SCREEN (UNTUK POWERPOINT)
  // ==========================================
  const startShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" },
        audio: false
      });
      screenStreamRef.current = stream;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;
      setIsSharing(true);
      setSourceMode('screen');

      stream.getVideoTracks()[0].onended = () => stopShareScreen();
    } catch (err) {
      console.error("Gagal share screen:", err);
    }
  };

  const stopShareScreen = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsSharing(false);
  };

  // ==========================================
  // HANDLER UNTUK UPLOAD GAMBAR LATAR BELAKANG KUSTOM
  // ==========================================
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setCustomBgUrl(img.src);
      setActiveTheme({
        id: "custom-image",
        name: "Gambar Kustom",
        accentColor: "#3b82f6",
        textColor: "#ffffff",
        subtitleColor: "#cbd5e1",
        bulletColor: "#f1f5f9",
        customImage: img
      });
    };
  };

  // ==========================================
  // LOOP UTAMA UNTUK MERENDER CANVAS STUDIO (1280x720)
  // ==========================================
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext("2d");
    let loopId: number;

    const renderStudioFrame = () => {
      if (!ctx || !mainCanvas) return;
      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

      if (sourceMode === 'pdf' && pdfCanvasRef.current && pdfDoc) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, 1280, 720);
        ctx.drawImage(pdfCanvasRef.current, 0, 0, 1280, 720);
      } else if (sourceMode === 'screen' && isSharing && screenVideoRef.current) {
        ctx.drawImage(screenVideoRef.current, 0, 0, 1280, 720);
      } else if (sourceMode === 'pdf-animation') {
        if (activeTheme.id === "custom-image" && activeTheme.customImage) {
          ctx.drawImage(activeTheme.customImage, 0, 0, 1280, 720);
          ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
          ctx.fillRect(0, 0, 1280, 720);
        } else if (activeTheme.bgGradientStart && activeTheme.bgGradientEnd) {
          const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
          gradient.addColorStop(0, activeTheme.bgGradientStart);
          gradient.addColorStop(1, activeTheme.bgGradientEnd);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1280, 720);

          ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
          ctx.beginPath(); ctx.arc(100, 100, 250, 0, Math.PI * 2); ctx.fill();
        }

        if (textAnimProgress.current < 1) {
          textAnimProgress.current += 0.02;
        }
        const progress = textAnimProgress.current;
        const currentData = animatedSlides[textSlideIndex];

        if (currentData) {
          const safePaddingX = 120; 
          const maxTextWidth = 1040;

          ctx.save();
          ctx.globalAlpha = Math.min(1, progress * 1.5);
          
          ctx.fillStyle = activeTheme.accentColor;
          ctx.fillRect(safePaddingX, 155, 120 * Math.min(1, progress * 2), 6);
          
          ctx.font = "bold 44px sans-serif";
          ctx.fillStyle = activeTheme.textColor;
          ctx.textAlign = "left";
          const titleY = 130 - (1 - Math.min(1, progress * 2)) * 10;
          ctx.fillText(currentData.title, safePaddingX, titleY, maxTextWidth);
          ctx.restore();

          if (progress > 0.2) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, (progress - 0.2) * 2);
            ctx.font = "italic 22px sans-serif";
            ctx.fillStyle = activeTheme.subtitleColor;
            ctx.fillText(currentData.subtitle, safePaddingX, 200, maxTextWidth);
            ctx.restore();
          }

          currentData.bullets.forEach((bullet, index) => {
            const triggerDelay = 0.3 + index * 0.12;
            if (progress > triggerDelay) {
              ctx.save();
              ctx.globalAlpha = Math.min(1, (progress - triggerDelay) * 3);
              ctx.font = "24px sans-serif";
              ctx.fillStyle = activeTheme.bulletColor;
              
              const bulletX = (safePaddingX + 30) + (1 - Math.min(1, (progress - triggerDelay) * 3)) * 15;
              const maxChar = 75;
              const displayText = bullet.length > maxChar ? bullet.substring(0, maxChar) + "..." : bullet;
              ctx.fillText(displayText, bulletX, 280 + index * 55, maxTextWidth - 30);
              ctx.restore();
            }
          });
        }
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 1280, 720);
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        ctx.fillText("Silakan unggah dokumen PDF atau hubungkan PPT Anda di panel kanan", 640, 360);
      }

      if (showWhiteboard && whiteboardCanvasRef.current) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(wbPosRef.current.x, wbPosRef.current.y, wbPosRef.current.w, wbPosRef.current.h);
        ctx.drawImage(whiteboardCanvasRef.current, wbPosRef.current.x, wbPosRef.current.y, wbPosRef.current.w, wbPosRef.current.h);
      }

      if (webcamVideoRef.current && isCamOn) {
        ctx.drawImage(webcamVideoRef.current, camPosRef.current.x, camPosRef.current.y, 260, 195);
      }

      loopId = requestAnimationFrame(renderStudioFrame);
    };

    renderStudioFrame();
    return () => cancelAnimationFrame(loopId);
  }, [sourceMode, pdfDoc, isSharing, showWhiteboard, isCamOn, animatedSlides, textSlideIndex, activeTheme]);

  const saveToIndexedDB = (id: string, blob: Blob, timestamp: string) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ id, blob, timestamp });
    };
  };

  const deleteRecording = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus hasil rekaman ini?")) return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id).onsuccess = () => {
        setRecordingsList((prev) => {
          const matched = prev.find(item => item.id === id);
          if (matched) URL.revokeObjectURL(matched.url);
          return prev.filter((item) => item.id !== id);
        });
      };
    };
  };

  const shareRecording = async (videoItem: RecordingHistory) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const cleanTimestamp = videoItem.timestamp.replace(/:/g, "-");
        const file = new File([videoItem.blob], `Rekaman_${cleanTimestamp}.mp4`, { type: "video/mp4" });
        await navigator.share({
          title: "Hasil Rekaman Kelas Studio",
          text: `Halo, berikut hasil rekaman materi kelas jam: ${videoItem.timestamp}`,
          files: [file],
        });
      } catch (err) {
        console.log("Berbagi dibatalkan atau tidak didukung berkas video:", err);
      }
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(videoItem.url);
        alert("Browser Anda tidak mendukung Web Share langsung. Tautan internal video telah disalin ke clipboard!");
      }
    }
  };

  const uploadVideoToBackend = async (videoItem: RecordingHistory) => {
    setRecordingsList((prev) => prev.map((item) => (item.id === videoItem.id ? { ...item, uploadStatus: "uploading" } : item)));
    const formData = new FormData();
    formData.append("video", videoItem.blob, `Studio_Record_${videoItem.timestamp.replace(/:/g, "-")}.mp4`);
    try {
      const response = await fetch(BACKEND_URL, { method: "POST", body: formData });
      if (!response.ok) throw new Error();
      setRecordingsList((prev) => prev.map((item) => (item.id === videoItem.id ? { ...item, uploadStatus: "success" } : item)));
    } catch {
      setRecordingsList((prev) => prev.map((item) => (item.id === videoItem.id ? { ...item, uploadStatus: "error" } : item)));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const pdfjs = await import("pdfjs-dist");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentSlide(1);

      const extractedSlides: ExtractedSlideData[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines: string[] = textContent.items
          .map((item: any) => item.str.trim())
          .filter((str: string) => str.length > 0);

        if (lines.length > 0) {
          const title = lines[0] || `Halaman ${i}`;
          const subtitle = lines[1] && lines[1].length < 60 ? lines[1] : `Dokumen: ${file.name}`;
          const rawBullets = lines.slice(subtitle === lines[1] ? 2 : 1, 8);
          const bullets = rawBullets.map((b) => (b.startsWith("•") || b.match(/^\d+\./) ? b : `• ${b}`));

          extractedSlides.push({
            title: title.length > 45 ? title.substring(0, 45) + "..." : title,
            subtitle,
            bullets: bullets.length > 0 ? bullets : ["(Tidak ada sub-teks terdeteksi)"]
          });
        }
      }

      if (extractedSlides.length > 0) {
        setAnimatedSlides(extractedSlides);
        setTextSlideIndex(0);
      }

      setSourceMode('pdf');
    } catch (err) {
      console.error("Gagal memproses dokumen PDF:", err);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = whiteboardCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = whiteboardCanvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX - rect.left) * (whiteboardCanvasRef.current!.width / rect.width),
      (e.clientY - rect.top) * (whiteboardCanvasRef.current!.height / rect.height)
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !showWhiteboard) return;
    const canvas = whiteboardCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = penWidth * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = "round";
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseDown = (type: "wb" | "cam", e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (type === "wb") setIsDraggingWb(true);
    if (type === "cam") setIsDraggingCam(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!frameContainerRef.current || (!isDraggingWb && !isDraggingCam)) return;
    const rect = frameContainerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStartRef.current.x) * (1280 / rect.width);
    const deltaY = (e.clientY - dragStartRef.current.y) * (720 / rect.height);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingWb) {
      setWbPos((p) => ({ ...p, x: Math.max(0, Math.min(1280 - p.w, p.x + deltaX)), y: Math.max(0, Math.min(720 - p.h, p.y + deltaY)) }));
    }
    if (isDraggingCam) {
      setCamPos((p) => ({ ...p, x: Math.max(0, Math.min(1280 - 260, p.x + deltaX)), y: Math.max(0, Math.min(720 - 195, p.y + deltaY)) }));
    }
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const mainCanvas = mainCanvasRef.current;
      if (!mainCanvas) return;

      const canvasStream = mainCanvas.captureStream(30);
      const audioTrack = (webcamVideoRef.current?.srcObject as MediaStream)?.getAudioTracks()[0];
      if (audioTrack) canvasStream.addTrack(audioTrack);

      const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/mp4" });
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const recordId = `rec-${Date.now()}`;
        saveToIndexedDB(recordId, blob, ts);
        setRecordingsList((prev) => [{ id: recordId, blob, url: URL.createObjectURL(blob), timestamp: ts, uploadStatus: "idle" }, ...prev]);
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) { console.error(err); }
  };

  return (
    <main onMouseMove={handleMouseMove} onMouseUp={() => { setIsDraggingWb(false); setIsDraggingCam(false); }} className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center select-none overflow-x-hidden font-sans w-full">
      
      <header className="w-full max-w-7xl flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-400">Studio Presentasi Hybrid Pro</h1>
          <p className="text-xs text-slate-400 mt-1">Sistem manajemen rekaman dengan pengaturan margin aman 120px & kustomisasi tema visual.</p>
        </div>
      </header>

      <div className="w-full max-w-7xl flex flex-col gap-4">
        <div ref={frameContainerRef} className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
          
          <canvas ref={mainCanvasRef} width={1280} height={720} className="w-full h-full object-contain pointer-events-none" />

          {/* NAVIGASI CONTROL SLIDE PDF ASLI */}
          {sourceMode === 'pdf' && pdfDoc && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-slate-900/90 border border-slate-700 backdrop-blur px-4 py-1.5 rounded-xl flex items-center gap-3 shadow-2xl">
              <button onClick={() => setCurrentSlide((p) => Math.max(1, p - 1))} disabled={currentSlide === 1} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px]">◀ Prev</button>
              <span className="text-[11px] font-mono font-semibold text-blue-400">{currentSlide} / {totalPages}</span>
              <button onClick={() => setCurrentSlide((p) => Math.min(totalPages, p + 1))} disabled={currentSlide === totalPages} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px]">Next ▶</button>
            </div>
          )}

          {/* NAVIGASI CONTROL SLIDE PDF EKSTRAK ANIMASI */}
          {sourceMode === 'pdf-animation' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-slate-900/90 border border-slate-700 backdrop-blur px-4 py-1.5 rounded-xl flex items-center gap-3 shadow-2xl">
              <button onClick={() => setTextSlideIndex(p => Math.max(0, p - 1))} disabled={textSlideIndex === 0} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px]">◀ Prev</button>
              <span className="text-[11px] font-mono font-semibold text-indigo-400">Slide {textSlideIndex + 1} / {animatedSlides.length}</span>
              <button onClick={triggerTextAnimation} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold">🔄 Replay</button>
              <button onClick={() => setTextSlideIndex(p => Math.min(animatedSlides.length - 1, p + 1))} disabled={textSlideIndex === animatedSlides.length - 1} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-[11px]">Next ▶</button>
            </div>
          )}

          {/* TOOLBAR PANEL KONTROL KANAN */}
          <div className="absolute right-0 top-0 bottom-0 z-40 transition-transform duration-300 flex items-center h-full" style={{ transform: isToolbarVisible ? "translateX(0)" : "translateX(calc(100% - 14px))" }}>
            <button onClick={() => setIsToolbarVisible(!isToolbarVisible)} className="bg-slate-800 border-2 border-r-0 border-slate-600 w-7 h-20 rounded-l-xl flex items-center justify-center text-xs text-blue-400 font-bold">{isToolbarVisible ? "▶" : "◀"}</button>

            <div className="bg-slate-900/95 border-l border-slate-700 backdrop-blur rounded-l-2xl flex flex-col w-64 h-full shadow-2xl text-xs overflow-hidden">
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-300 text-center uppercase tracking-wider">⚙️ Panel Kontrol Studio</div>
              
              <div className="p-3 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* PILIHAN TAB SUMBER MATERI */}
                <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase px-1">Pilih Sumber Materi:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button onClick={() => setSourceMode('pdf')} className={`py-1 text-[10px] text-center font-bold rounded transition-all ${sourceMode === 'pdf' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>📄 PDF</button>
                    <button onClick={() => setSourceMode('pdf-animation')} className={`py-1 text-[10px] text-center font-bold rounded transition-all ${sourceMode === 'pdf-animation' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>✨ Teks</button>
                    <button onClick={() => setSourceMode('screen')} className={`py-1 text-[10px] text-center font-bold rounded transition-all ${sourceMode === 'screen' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>🖥️ PPT</button>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 mt-1">
                    {sourceMode !== 'screen' ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-blue-400 font-semibold mb-1">Unggah Dokumen (PDF):</span>
                        <input type="file" accept="application/pdf" onChange={handleFileUpload} className="text-[9px] text-slate-400 cursor-pointer w-full" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-blue-400 font-semibold mb-1">Hubungkan Presentasi Windows:</span>
                        {!isSharing ? (
                          <button onClick={startShareScreen} className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 font-bold rounded text-[10px] text-white">Hubungkan Jendela PPT</button>
                        ) : (
                          <button onClick={stopShareScreen} className="w-full py-1.5 bg-red-950 text-red-400 border border-red-800 font-bold rounded text-[10px]">Putus Koneksi Screen</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* PANEL PILIHAN TEMA STUDIO + UPLOAD BACKGROUND GAMBAR */}
                {sourceMode === 'pdf-animation' && (
                  <div className="bg-slate-950 p-2 rounded-xl border border-indigo-500/30 flex flex-col gap-2">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase px-0.5">🎨 Tema Latar Presentasi:</span>
                    
                    {/* Grid Pilihan Tema Gradasi Bawaan */}
                    <div className="grid grid-cols-2 gap-1">
                      {STUDIO_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setActiveTheme(theme)}
                          style={{ borderColor: activeTheme.id === theme.id ? theme.accentColor : "transparent" }}
                          className={`p-1.5 rounded border text-[10px] font-semibold text-left transition-all bg-slate-900 hover:bg-slate-800 ${activeTheme.id === theme.id ? 'text-white border-2' : 'text-slate-400'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: `linear-gradient(135deg, ${theme.bgGradientStart}, ${theme.bgGradientEnd})` }} />
                            <span className="truncate">{theme.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Input Upload Gambar Latar Belakang Kustom */}
                    <div className="border-t border-slate-800 pt-2 flex flex-col gap-1">
                      <span className="text-[9px] text-slate-400 font-semibold">🖼️ Unggah Gambar Latar:</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleBgImageUpload} 
                        className="text-[9px] text-slate-400 cursor-pointer w-full" 
                      />
                      
                      {/* Tombol pintas pilih kembali gambar kustom jika sudah pernah di-upload */}
                      {customBgUrl && (
                        <button 
                          onClick={() => {
                            const img = new Image();
                            img.src = customBgUrl;
                            img.onload = () => {
                              setActiveTheme({
                                id: "custom-image",
                                name: "Gambar Kustom",
                                accentColor: "#3b82f6",
                                textColor: "#ffffff",
                                subtitleColor: "#cbd5e1",
                                bulletColor: "#f1f5f9",
                                customImage: img
                              });
                            };
                          }}
                          className={`w-full py-1 rounded text-[9px] text-center font-bold border transition-all ${activeTheme.id === 'custom-image' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'}`}
                        >
                          Gunakan Gambar Kustom Anda
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* MEDIA KAMERA DAN DETEKSI */}
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-3">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Kamera Pengajar:</label>
                  
                  {/* Dropdown Pemilihan Kamera Terdeteksi */}
                  <select 
                    value={selectedCamera} 
                    onChange={(e) => handleCameraChange(e.target.value)}
                    className="w-full py-1 px-2 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[10px] font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Kamera ${videoDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                    {videoDevices.length === 0 && <option value="">Tidak ada kamera terdeteksi</option>}
                  </select>

                  <button 
                    onClick={toggleCamera} 
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${isCamOn ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-red-950 border border-red-700 text-red-400 hover:bg-red-900"}`}
                  >
                    {isCamOn ? "📹 Kamera Utama: LIVE" : "🚫 Kamera Utama: OFF"}
                  </button>
                </div>

                {/* PAPAN TULIS INTERAKTIF */}
                <button onClick={() => setShowWhiteboard(!showWhiteboard)} className={`py-2 px-2 rounded-lg font-semibold border text-[11px] flex items-center justify-center gap-1.5 ${showWhiteboard ? "bg-amber-600 border-amber-400 text-white" : "bg-slate-800 border-slate-700 text-slate-300"}`}>
                  {showWhiteboard ? "Papan Tulis: AKTIF" : "✏️ Buka Papan Tulis"}
                </button>

                {showWhiteboard && (
                  <div className="flex flex-col gap-1.5 bg-slate-950 p-2 rounded-lg border border-amber-500/30">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setIsEraser(false)} className={`px-2 py-0.5 rounded text-[9px] font-bold ${!isEraser ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>Spidol</button>
                      <button onClick={() => setIsEraser(true)} className={`px-2 py-0.5 rounded text-[9px] font-bold ${isEraser ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>Hapus</button>
                    </div>
                    <button onClick={() => whiteboardCanvasRef.current?.getContext("2d")?.clearRect(0, 0, 1280, 720)} className="w-full py-0.5 bg-red-950/40 text-red-400 text-[9px] rounded border border-red-900/30">Reset Halaman</button>
                  </div>
                )}

                {/* LIST VIDEO REKAMAN */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="text-[10px] text-green-400 font-bold uppercase border-b border-slate-800 pb-1">🎬 Hasil Rekaman Lokal</div>
                  {recordingsList.map((video) => (
                    <div key={video.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-mono">Jam: {video.timestamp}</span>
                        <button onClick={() => deleteRecording(video.id)} className="text-[10px] text-red-400 hover:text-red-500 font-bold px-1 rounded">
                          🗑️ Hapus
                        </button>
                      </div>
                      
                      <video src={video.url} controls className="w-full aspect-video rounded bg-black" />
                      
                      <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                        <button onClick={() => uploadVideoToBackend(video)} className="py-1 bg-blue-600 hover:bg-blue-500 rounded font-bold text-[9px] text-white">
                          ☁️ Server
                        </button>
                        <button onClick={() => shareRecording(video)} className="py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-[9px] text-white flex items-center justify-center gap-1">
                          🔗 Bagikan
                        </button>
                      </div>
                    </div>
                  ))}
                  {recordingsList.length === 0 && (
                    <span className="text-[10px] text-slate-600 text-center italic mt-2 block">Belum ada hasil rekaman.</span>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* OVERLAY WHITEBOARD MELAYANG */}
          {showWhiteboard && (
            <div style={{ left: `${(wbPos.x / 1280) * 100}%`, top: `${(wbPos.y / 720) * 100}%`, width: `${(wbPos.w / 1280) * 100}%`, height: `${(wbPos.h / 720) * 100}%` }} className="absolute z-10 border-2 border-amber-500 bg-slate-900/90 rounded-xl overflow-hidden flex flex-col shadow-2xl">
              <div onMouseDown={(e) => handleMouseDown("wb", e)} className="bg-amber-600/30 border-b border-amber-500/40 px-3 py-1 cursor-move text-[11px] text-amber-300 font-semibold">✋ Geser Papan Tulis</div>
              <canvas ref={whiteboardCanvasRef} width={wbPos.w} height={wbPos.h} onMouseDown={startDrawing} onMouseUp={() => setIsDrawing(false)} onMouseMove={draw} onMouseLeave={() => setIsDrawing(false)} className="w-full h-full cursor-crosshair" />
            </div>
          )}

          {/* OVERLAY BOX KAMERA MELAYANG */}
          <div onMouseDown={(e) => handleMouseDown("cam", e)} style={{ left: `${(camPos.x / 1280) * 100}%`, top: `${(camPos.y / 720) * 100}%`, width: "20.3%", height: "27.1%" }} className="absolute z-20 cursor-move border-2 border-sky-400 rounded-lg overflow-hidden shadow-2xl bg-slate-950 flex flex-col justify-center items-center">
            {isCamOn ? (
              <div className="w-full h-full relative">
                <video ref={webcamVideoRef} className="w-full h-full object-cover pointer-events-none" autoPlay playsInline muted />
                <span className="absolute bottom-1 left-1 bg-slate-900/80 px-1.5 py-0.5 text-[8px] text-sky-400 font-bold rounded">🎙️ PREVIEW</span>
              </div>
            ) : (
              <div className="text-center p-2 text-slate-500 text-[10px] flex flex-col items-center gap-1">
                <span>📷</span>
                <span>Kamera Off</span>
              </div>
            )}
          </div>

          {/* TOMBOL UTAMA REKAMAN */}
          <div className="absolute top-4 left-4 z-30">
            {!recording ? (
              <button onClick={startRecording} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition hover:bg-red-500 shadow-md">🔴 Mulai Rekam Kelas</button>
            ) : (
              <button onClick={() => { mediaRecorderRef.current?.stop(); setRecording(false); }} className="px-4 py-2 bg-slate-900 text-red-400 border border-red-500 font-bold rounded-xl text-xs transition hover:bg-slate-800">⏹ Selesai</button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
