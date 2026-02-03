"use client";
import React, { useState } from 'react';
import { 
  Network, Shield, Globe, HardDrive, Terminal, 
  HelpCircle, ChevronRight, ChevronDown, Menu, X, PlayCircle,
  Cpu, Activity, Lock, Share2, Server
} from 'lucide-react';
// Pastikan file ini ada di folder constants Anda
import { NETWORK_CONTENT } from '@/constants/networkData';

const NetworkPresentation = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState('materi');

  // Konten Utama Presentasi
  const content = {
    intro: {
      title: "The Silent Crisis: Satu Jam Tanpa Internet",
      icon: <Globe className="text-rose-500" />,
      body: (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-xl shadow-sm">
            <h3 className="text-xl font-bold text-rose-700 mb-3 flex items-center gap-2">
              <Activity size={24} /> STUDI KASUS: Global Blackout
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Jika internet mati total selama 60 menit:
            </p>
            <ul className="mt-3 space-y-3 text-slate-600">
              <li className="flex gap-2"><strong>• Finansial:</strong> Transaksi senilai $2.1 Miliar terhenti (E-commerce, Saham, Banking).</li>
              <li className="flex gap-2"><strong>• Logistik:</strong> GPS dan sistem manifest kargo global buta arah.</li>
              <li className="flex gap-2"><strong>• Medis:</strong> Akses rekam medis berbasis Cloud di RS tidak dapat diakses.</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1 italic text-sm underline">Visual Hook</h4>
            <p className="text-xs text-slate-500 italic">"Gunakan poin ini untuk menekankan bahwa jaringan bukan sekadar hobi, tapi tulang punggung ekonomi modern."</p>
          </div>
        </div>
      )
    },
    hardware: {
      title: "Anatomi Perangkat Keras Jaringan",
      icon: <Cpu className="text-blue-500" />,
      body: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                   <HardDrive size={18} /> Switch (Layer 2)
                </h3>
                <p className="text-sm text-slate-600">Penghubung perangkat dalam LAN. Cerdas mengirim data hanya ke perangkat tujuan berdasarkan <strong>MAC Address</strong>.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                   <Network size={18} /> Router (Layer 3)
                </h3>
                <p className="text-sm text-slate-600">Gerbang antar jaringan. Mengarahkan lalu lintas data dunia menggunakan <strong>IP Address</strong>.</p>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border-4 border-slate-800 shadow-xl">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2 italic">
                <PlayCircle className="text-blue-400" /> Demo Visual: Kabel RJ45
              </h4>
              <div className="flex justify-center gap-1 mb-4">
                {['bg-orange-400', 'bg-orange-600', 'bg-green-200', 'bg-blue-600', 'bg-blue-300', 'bg-green-600', 'bg-amber-200', 'bg-amber-800'].map((color, i) => (
                  <div key={i} className={`w-3 h-16 ${color} rounded-t-sm border border-black/20`} title="T568B Standard"></div>
                ))}
              </div>
              <p className="text-[11px] text-center opacity-70 italic font-mono">Standar TIA/EIA-568B: Putih-O, O, Putih-H, B, Putih-B, H, Putih-C, C</p>
            </div>
          </div>
        </div>
      )
    },
    topologi: {
      title: "Arsitektur & Topologi",
      icon: <Share2 className="text-cyan-500" />,
      body: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Star', desc: 'Paling populer. Semua ke pusat (Switch).', icon: '⭐' },
              { name: 'Mesh', desc: 'Sangat aman, semua terhubung ke semua.', icon: '🕸️' },
              { name: 'Bus', desc: 'Satu jalur utama untuk semua perangkat.', icon: '🚌' }
            ].map((t) => (
              <div key={t.name} className="p-4 border border-slate-200 rounded-xl text-center hover:bg-cyan-50 transition">
                <div className="text-2xl mb-2">{t.icon}</div>
                <h4 className="font-bold">{t.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          

[Image of star mesh and bus network topologies]

        </div>
      )
    },
    osi: {
      title: "Model OSI (7 Layer)",
      icon: <Server className="text-purple-500" />,
      body: (
        <div className="space-y-2">
          {[
            { n: 7, l: "Application", d: "Interface pengguna (HTTP, FTP, Email)" },
            { n: 6, l: "Presentation", d: "Enkripsi & Kompresi data" },
            { n: 5, l: "Session", d: "Manajemen koneksi" },
            { n: 4, l: "Transport", d: "TCP/UDP (Pengiriman data)" },
            { n: 3, l: "Network", d: "Routing & IP Address" },
            { n: 2, l: "Data Link", d: "MAC Address & Switch" },
            { n: 1, l: "Physical", d: "Kabel, Listrik, Bit" },
          ].map((layer) => (
            <div key={layer.n} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:translate-x-2 transition-transform">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {layer.n}
              </div>
              <div>
                <h4 className="font-bold text-sm">{layer.l} Layer</h4>
                <p className="text-xs text-slate-500">{layer.d}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    demo_ip: {
      title: "Live Terminal: Cek Identitas Digital",
      icon: <Terminal className="text-emerald-500" />,
      body: (
        <div className="space-y-6">
          <p className="text-slate-600 italic font-medium underline">Langkah Demo: Buka CMD di laptop Anda sekarang dan ketik perintah ini.</p>
          <div className="bg-[#1e1e1e] text-emerald-400 p-6 rounded-lg font-mono shadow-2xl border border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20"><Terminal size={80}/></div>
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-500 ml-2 italic underline">root@mejatika:~</span>
            </div>
            <p className="mb-2 text-slate-400">$ ip addr show</p>
            <p className="text-emerald-200">2: wlan0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt;</p>
            <p className="ml-4 font-bold text-white underline decoration-emerald-500">inet 192.168.1.15/24 brd 192.168.1.255</p>
            <p className="ml-4 text-emerald-500/60 italic">valid_lft forever preferred_lft forever</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-emerald-800">
            <strong>Analogi Jitu:</strong> IP Address adalah <strong>Alamat Rumah</strong>, sedangkan Port (seperti :80 atau :443) adalah <strong>Nomor Pintu</strong> spesifik di rumah tersebut.
          </div>
        </div>
      )
    },
    security: {
      title: "Keamanan & Protokol",
      icon: <Lock className="text-amber-500" />,
      body: (
        <div className="space-y-6">
          <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Shield size={18}/> HTTP vs HTTPS
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              Bayangkan Anda mengirim surat:
              <br/>• <strong>HTTP:</strong> Mengirim kartu pos (Semua orang di kantor pos bisa baca).
              <br/>• <strong>HTTPS:</strong> Mengirim kotak besi terkunci (Hanya Anda dan penerima yang punya kuncinya).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 border border-slate-200 rounded-lg shadow-sm hover:border-rose-300 transition">
                <Shield className="mb-2 text-rose-500" />
                <h5 className="font-bold uppercase text-xs tracking-widest">Firewall</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">Sistem keamanan yang memonitor dan mengontrol lalu lintas jaringan masuk dan keluar berdasarkan aturan keamanan yang ditentukan.</p>
             </div>
             <div className="p-4 border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition">
                <Network className="mb-2 text-blue-500" />
                <h5 className="font-bold uppercase text-xs tracking-widest">VPN</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">Virtual Private Network: Membuat jalur pribadi di atas jaringan publik agar data Anda tidak bisa diintip orang lain di Wi-Fi yang sama.</p>
             </div>
          </div>
        </div>
      )
    },
    qa: {
      title: "Sesi Interaktif & FAQ",
      icon: <HelpCircle className="text-indigo-500" />,
      body: (
        <div className="space-y-6">
          {[
            { q: "Mengapa Wi-Fi penuh tapi internet lambat?", a: "Sinyal Wi-Fi adalah kekuatan koneksi ke router Anda (jalur ke rumah). Internet lambat berarti 'pipa' ISP Anda ke dunia luar sedang bocor atau terlalu kecil (Bandwidth)." },
            { q: "Apa itu Cloud?", a: "Sederhananya: Cloud adalah komputer milik orang lain (Server) yang Anda akses melalui jaringan internet." },
            { q: "Apa itu DNS?", a: "Buku telepon internet. DNS mengubah 'mejatika.com' menjadi alamat angka (IP) yang dimengerti komputer." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-sm border-b-4 border-b-indigo-200">
              <h4 className="font-bold text-indigo-900 flex gap-2"><span>Q:</span> {item.q}</h4>
              <p className="text-slate-600 mt-2 text-sm italic font-medium leading-relaxed pl-6">" {item.a} "</p>
            </div>
          ))}
        </div>
      )
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans antialiased text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Network size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter uppercase">MEJATIKA</span>}
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1">
            <SidebarLink 
              active={activeTab === 'intro'} 
              onClick={() => setActiveTab('intro')}
              icon={<Globe size={20} />}
              label="Studi Kasus"
              isOpen={isSidebarOpen}
            />

            <li>
              <button 
                onClick={() => setOpenSubmenu(openSubmenu === 'materi' ? '' : 'materi')}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <HardDrive size={20} />
                  {isSidebarOpen && <span className="font-medium text-sm">Materi Inti</span>}
                </div>
                {isSidebarOpen && (openSubmenu === 'materi' ? <ChevronDown size={14}/> : <ChevronRight size={14}/>)}
              </button>
              
              {openSubmenu === 'materi' && isSidebarOpen && (
                <ul className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <SubmenuLink label="Hardware Jaringan" active={activeTab === 'hardware'} onClick={() => setActiveTab('hardware')} />
                  <SubmenuLink label="Topologi Jaringan" active={activeTab === 'topologi'} onClick={() => setActiveTab('topologi')} />
                  <SubmenuLink label="Model OSI" active={activeTab === 'osi'} onClick={() => setActiveTab('osi')} />
                  <SubmenuLink label="Keamanan & SSL" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                </ul>
              )}
            </li>

            <SidebarLink 
              active={activeTab === 'demo_ip'} 
              onClick={() => setActiveTab('demo_ip')}
              icon={<Terminal size={20} />}
              label="Live Demo Terminal"
              isOpen={isSidebarOpen}
            />
            <SidebarLink 
              active={activeTab === 'qa'} 
              onClick={() => setActiveTab('qa')}
              icon={<HelpCircle size={20} />}
              label="Tanya Jawab"
              isOpen={isSidebarOpen}
            />
          </ul>
        </nav>

        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-all border-t border-slate-800"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
              {content[activeTab].icon}
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{content[activeTab].title}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Digital Infrastructure
            </span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <div className="p-8 md:p-12 min-h-[500px]">
                {content[activeTab].body}
              </div>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
              <p>Mejatika Academy — Computer Network Course</p>
              <div className="flex gap-4">
                <span>Ref: TIA/EIA-568</span>
                <span>OSI Model v2.1</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Sub-components
const SidebarLink = ({ active, onClick, icon, label, isOpen }) => (
  <li>
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {isOpen && <span className="font-semibold text-sm tracking-tight">{label}</span>}
    </button>
  </li>
);

const SubmenuLink = ({ label, active,
