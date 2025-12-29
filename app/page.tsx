"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Splash } from "@/components/splash"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { NewsSlider } from "@/components/news-slider"
import { NewsList } from "@/components/news-list"
import { ScheduleSidebar } from "@/components/schedule-sidebar"
import { Footer } from "@/components/footer"
import { RunningText } from "@/components/running-text"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, ChevronRight, ChevronLeft, Quote, ArrowLeft, Share2 } from "lucide-react"

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedSlug) {
      setLoadingDetail(true)
      setCurrentPage(1)
      // Smooth scroll ke atas saat buka berita
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoadingDetail(false)
        })
        .catch(() => setLoadingDetail(false))
    }
  }, [selectedSlug])

  // Fungsi pembagi konten agar pas di frame halaman
  const getPagedContent = (htmlContent: string) => {
    if (!htmlContent) return ["", "", ""];
    const cleanText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    
    const part1 = cleanText.match(/[\s\S]{1,750}(?=\s|$)/g) || [cleanText];
    const remaining = cleanText.substring(part1[0].length);
    const otherParts = remaining.match(/[\s\S]{1,900}(?=\s|$)/g) || ["", ""];
    
    return [part1[0] || "", otherParts[0] || "", otherParts[1] || ""];
  };

  if (showSplash) return <Splash />

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-6 lg:py-10">
        <RunningText />

        <AnimatePresence mode="wait">
          {!selectedSlug ? (
            /* --- SECTION 1: LIST BERITA --- */
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6"
            >
              <div className="lg:col-span-2 space-y-8">
                <NewsSlider onReadMore={(slug) => setSelectedSlug(slug)} />
                <NewsList onReadMore={(slug) => setSelectedSlug(slug)} />
              </div>
              <div className="lg:col-span-1">
                <ScheduleSidebar />
              </div>
            </motion.div>
          ) : (
            /* --- SECTION 2: DETAIL BERITA (FULL PAGE DESIGN) --- */
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="mt-6 flex flex-col gap-6"
            >
              {/* Header Back Button */}
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setSelectedSlug(null)}
                  variant="ghost" 
                  className="group gap-2 hover:bg-primary/10 font-bold uppercase text-[10px] tracking-[0.2em]"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Kembali
                </Button>
                <Badge variant="outline" className="opacity-40 uppercase text-[9px] tracking-widest font-black">
                  Mejatika Magazine Edition
                </Badge>
              </div>

              {/* Magazine Container */}
              <div className="w-full min-h-[80vh] flex flex-col lg:flex-row bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border border-black/5 relative">
                
                {loadingDetail ? (
                  <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Membuka Halaman...</p>
                  </div>
                ) : article && (
                  <>
                    {/* HALAMAN KIRI */}
                    <motion.div 
                      key={`left-${currentPage}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex-1 h-full flex flex-col border-r border-black/5 relative bg-white dark:bg-zinc-950"
                    >
                      <div className="flex-grow p-8 lg:p-16">
                        {currentPage === 1 ? (
                          <div className="space-y-8">
                            <Badge className="bg-primary text-white border-none uppercase tracking-[0.2em] font-black text-[9px] px-3 py-1.5">
                              {article.category?.name}
                            </Badge>
                            <h1 className="text-3xl lg:text-5xl font-black uppercase leading-tight italic tracking-tighter text-zinc-900 dark:text-white">
                              {article.title}
                            </h1>
                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-8 ring-zinc-50 dark:ring-zinc-900">
                              <img src={article.image} className="w-full h-full object-cover" alt="cover" />
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-t border-black/5 pt-8">
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {article.user?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300 first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                            {getPagedContent(article.content)[1]}
                          </div>
                        )}
                      </div>
                      <div className="h-20 px-16 border-t border-black/5 flex items-center justify-between text-[10px] font-black opacity-20 tracking-[0.4em]">
                         <span>MEJATIKA DIGITAL</span>
                         <span>P. {currentPage === 1 ? "01" : "03"}</span>
                      </div>
                    </motion.div>

                    {/* SPINE */}
                    <div className="hidden lg:block w-[1px] h-full bg-black/5 relative z-10">
                       <div className="absolute inset-0 -left-10 w-20 bg-gradient-to-r from-black/[0.03] via-transparent to-black/[0.03] pointer-events-none" />
                    </div>

                    {/* HALAMAN KANAN */}
                    <motion.div 
                      key={`right-${currentPage}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex-1 h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/10"
                    >
                      <div className="flex-grow p-8 lg:p-16">
                        <div className="text-lg text-justify leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {currentPage === 1 ? (
                            <div>{getPagedContent(article.content)[0]}</div>
                          ) : (
                            <div className="space-y-10">
                              <p>{getPagedContent(article.content)[2]}</p>
                              
                              {/* DISPLAY QUOTE */}
                              {article.quote && (
                                <motion.div 
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative py-10 px-12 border-l-8 border-primary bg-white dark:bg-zinc-900 rounded-r-[3rem] shadow-xl italic"
                                >
                                  <Quote className="absolute top-6 right-8 w-16 h-16 opacity-5 text-primary" />
                                  <p className="text-xl font-black leading-snug text-zinc-800 dark:text-zinc-100 uppercase tracking-tighter">
                                    "{article.quote}"
                                  </p>
                                  <div className="mt-4 flex items-center gap-2">
                                    <div className="h-1 w-8 bg-primary rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Editor's Note</span>
                                  </div>
                                </motion.div>
                              )}
                              
                              <div className="flex flex-col items-center gap-4 pt-10 opacity-30">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Finish Reading</span>
                                <div className="flex gap-4">
                                  <Share2 className="w-4 h-4" />
                                  <div className="h-[1px] w-20 bg-current my-auto" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NAVIGASI NEXT PAGE */}
                      <div className="h-24 px-16 border-t border-black/5 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
                        <span className="text-[10px] font-black opacity-20 tracking-[0.4em]">P. {currentPage === 1 ? "02" : "04"}</span>
                        
                        <div className="flex gap-4">
                          {currentPage === 1 ? (
                            <Button 
                              onClick={() => {
                                setCurrentPage(2);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }} 
                              className="rounded-full h-12 px-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 transition-all font-black text-[10px] tracking-[0.2em] uppercase"
                            >
                              Halaman Berikutnya <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => {
                                setCurrentPage(1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }} 
                              variant="outline"
                              className="rounded-full h-12 px-10 border-2 font-black text-[10px] tracking-[0.2em] uppercase"
                            >
                              <ChevronLeft className="w-5 h-5 mr-2" /> Kembali
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  )
}
