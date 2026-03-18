{/* --- REPORT PANEL (STATIC MODE) --- */}
        <div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
          <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
            {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">Knowledge Base</span>
          </button>
          
          <div className="w-[340px] bg-white h-full p-6 shadow-2xl overflow-y-auto border-l border-slate-200 custom-scrollbar">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800">
              <Network className="text-blue-600"/> Katalog Topologi
            </h2>

            <div className="space-y-8 pb-20">
              
              {/* --- TOPOLOGI BUS --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-blue-500 w-2 h-4 rounded-sm"></div> Topologi Bus
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Menghubungkan semua node ke satu kabel pusat (backbone). <br/>
                  <b>Fungsi:</b> Transmisi data sederhana pada jaringan skala kecil/linear.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Hemat kabel, biaya murah, instalasi sangat mudah.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Jika backbone putus, semua mati; rawan tabrakan data.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI STAR --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-yellow-500 w-2 h-4 rounded-sm"></div> Topologi Star
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Perangkat terhubung ke hub/switch pusat sebagai pengatur trafik. <br/>
                  <b>Fungsi:</b> Manajemen jaringan terpusat untuk perkantoran dan lab komputer.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Mudah troubleshoot; satu node rusak tak ganggu yang lain.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Boros kabel; jika switch pusat rusak, jaringan lumpuh.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI RING --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-purple-500 w-2 h-4 rounded-sm"></div> Topologi Ring
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Node terhubung membentuk lingkaran; data mengalir satu arah. <br/>
                  <b>Fungsi:</b> Menghindari collision data dengan aliran yang teratur (token).
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Aliran data cepat & stabil meski beban trafik tinggi.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Sulit menambah node; satu node rusak memutus sirkuit.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI MESH --- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-orange-500 w-2 h-4 rounded-sm"></div> Topologi Mesh
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Setiap node terhubung ke setiap node lain (Full Connected). <br/>
                  <b>Fungsi:</b> Digunakan untuk sistem kritis yang butuh keamanan & redundansi tinggi.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Sangat kuat; data tetap mengalir via jalur cadangan jika satu putus.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Instalasi tersulit; butuh kabel & biaya paling banyak.
                  </div>
                </div>
              </section>

              {/* --- TOPOLOGI HYBRID --- */}
              <section className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 bg-slate-900 text-white p-2 rounded-lg text-[11px] font-black uppercase tracking-tighter">
                  <div className="bg-pink-500 w-2 h-4 rounded-sm"></div> Topologi Hybrid
                </div>
                <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                  <b>Definisi:</b> Kombinasi dua atau lebih jenis topologi yang berbeda. <br/>
                  <b>Fungsi:</b> Integrasi infrastruktur berskala luas (Enterprise).
                </p>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  <div className="bg-green-50 p-2 rounded-md border border-green-100 text-green-700">
                    <b>+</b> Sangat fleksibel; bisa disesuaikan kebutuhan gedung.
                  </div>
                  <div className="bg-red-50 p-2 rounded-md border border-red-100 text-red-700">
                    <b>-</b> Manajemen rumit; butuh teknisi ahli dan biaya mahal.
                  </div>
                </div>
              </section>

            </div>

            {/* Credit Footer */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                Sanpio AI Lab Knowledge Base © 2026
              </p>
            </div>
          </div>
        </div>
