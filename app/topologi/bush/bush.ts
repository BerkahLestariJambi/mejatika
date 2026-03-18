{/* --- REPORT PANEL --- */}
<div className={`absolute top-0 right-0 h-full flex z-[110] transition-transform duration-500 ${showPanel ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
  <button onClick={() => setShowPanel(!showPanel)} className="h-full bg-slate-900 text-white w-10 flex flex-col items-center justify-center gap-4 hover:bg-blue-600 transition-colors">
    {showPanel ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
    <span className="[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-widest">Reports</span>
  </button>
  <div className="w-[340px] bg-white h-full p-8 shadow-2xl overflow-y-auto">
    <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3 border-b pb-4 text-slate-800">
      <Info className="text-blue-600"/> Analisis Sistem
    </h2>
    
    <div className="space-y-4 text-[10px] font-bold text-slate-600 uppercase">
       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
         Topology: <span className="text-blue-600">{topologyType || 'Custom'}</span>
       </div>
       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
         Nodes Count: <span>{nodes.length} Devices</span>
       </div>
       
       <div className="mt-8 border-t pt-4">
          <h4 className="text-blue-600 mb-3 tracking-widest flex items-center gap-2">
            <Activity size={12}/> Teori Jaringan:
          </h4>
          <div className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-blue-100 pl-4 normal-case font-medium">
            {topologyType === 'bus' && "Topologi Bus menggunakan satu kabel pusat (backbone) sebagai media transmisi utama."}
            {/* ... teori lainnya tetap sama ... */}
            {!topologyType && "Silakan pilih template di atas."}
          </div>
       </div>

       {/* --- MATERI KHUSUS TOPOLOGI BUS --- */}
       {topologyType === 'bus' && (
         <div className="mt-6 space-y-6 normal-case">
           {/* Pengertian */}
           <div>
             <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-wider mb-2">Apa itu Topologi Bus?</h4>
             <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10.5px] leading-relaxed shadow-inner">
               Topologi Bus adalah arsitektur jaringan di mana setiap simpul (node) terhubung ke satu kabel utama tunggal yang disebut <b>backbone</b>. Data dikirimkan dalam bentuk sinyal listrik ke seluruh kabel, namun hanya perangkat dengan alamat yang sesuai yang akan menerima data tersebut.
             </div>
           </div>

           {/* Kelebihan */}
           <div>
             <h4 className="text-green-600 font-black text-[11px] uppercase tracking-wider mb-2">Kelebihan:</h4>
             <ul className="space-y-2 text-[10.5px] text-slate-500 font-medium list-disc pl-4">
               <li><b>Efisiensi Biaya:</b> Memerlukan lebih sedikit kabel dibandingkan topologi lainnya.</li>
               <li><b>Kemudahan Instalasi:</b> Sangat sederhana untuk diatur dan dihubungkan.</li>
               <li><b>Skalabilitas:</b> Mudah untuk menambah node baru cukup dengan menyambungkannya ke kabel backbone.</li>
             </ul>
           </div>

           {/* Kekurangan */}
           <div>
             <h4 className="text-red-600 font-black text-[11px] uppercase tracking-wider mb-2">Kekurangan:</h4>
             <ul className="space-y-2 text-[10.5px] text-slate-500 font-medium list-disc pl-4">
               <li><b>Titik Kegagalan Tunggal:</b> Jika kabel utama (backbone) putus, seluruh jaringan akan mati total.</li>
               <li><b>Tabrakan Data (Collision):</b> Semakin banyak node, semakin besar risiko tabrakan data yang memperlambat jaringan.</li>
               <li><b>Keamanan Rendah:</b> Semua node dapat melihat aliran data yang lewat di kabel utama.</li>
             </ul>
           </div>
         </div>
       )}

       {/* Placeholder jika belum pilih topologi */}
       {!topologyType && (
          <div className="mt-10 text-center opacity-30">
            <p className="text-[9px] font-black uppercase italic">Pilih topologi untuk melihat analisis detail</p>
          </div>
       )}
    </div>
  </div>
</div>
