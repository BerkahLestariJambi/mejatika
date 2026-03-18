{/* --- REPORT PANEL (STATIC MODE) --- */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button 
            type="button"
            onClick={() => setShowPanel(!showPanel)} 
            className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors"
          >
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">Knowledge Base</span>
          </button>
          
          <div className="w-[340px] bg-white h-full p-6 shadow-2xl overflow-y-auto border-l border-slate-200 scrollbar-hide">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800">
              <Network className="text-blue-600"/> Katalog Topologi
            </h2>

            <div className="space-y-8 pb-20">
              {/* --- TOPOLOGI BUS --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-blue-500 w-2 h-4 rounded-sm"></div> Topologi Bus
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium normal-case">
                  <b>Definisi:</b> Menghubungkan semua node ke satu kabel pusat (backbone). <br/>
                  <b>Fungsi:</b> Transmisi data sederhana pada jaringan skala kecil/linear.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] normal-case">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Hemat kabel & biaya murah.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Jika backbone putus, semua mati.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI STAR --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-yellow-500 w-2 h-4 rounded-sm"></div> Topologi Star
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium normal-case">
                  <b>Definisi:</b> Perangkat terhubung ke switch pusat sebagai pengatur trafik. <br/>
                  <b>Fungsi:</b> Manajemen jaringan terpusat (Lab/Kantor).
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] normal-case">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Mudah troubleshoot & stabil.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Boros kabel & tergantung switch.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI RING --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-purple-500 w-2 h-4 rounded-sm"></div> Topologi Ring
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium normal-case">
                  <b>Definisi:</b> Node terhubung membentuk lingkaran tertutup. <br/>
                  <b>Fungsi:</b> Aliran data searah berkecepatan tinggi.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] normal-case">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Tidak ada tabrakan data (collision).
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Satu node rusak, jaringan putus.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI MESH --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-orange-500 w-2 h-4 rounded-sm"></div> Topologi Mesh
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium normal-case">
                  <b>Definisi:</b> Setiap node terhubung ke setiap node lain. <br/>
                  <b>Fungsi:</b> Keamanan dan redundansi maksimal (Sistem Kritis).
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] normal-case">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Jalur cadangan sangat banyak.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Biaya & instalasi sangat rumit.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI HYBRID --- */}
              <section className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-pink-500 w-2 h-4 rounded-sm"></div> Topologi Hybrid
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium normal-case">
                  <b>Definisi:</b> Gabungan dari dua atau lebih topologi berbeda. <br/>
                  <b>Fungsi:</b> Infrastruktur kompleks perusahaan besar.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] normal-case">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Fleksibel mengikuti kebutuhan.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Perawatan sangat sulit & mahal.
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                Sanpio AI Lab Knowledge Base © 2026
              </p>
            </div>
          </div>
        </div>
