"use client";
import React, { useState } from 'react';
import { 
  Network, Shield, Globe, HardDrive, Terminal, 
  HelpCircle, ChevronRight, ChevronDown, Menu, X, PlayCircle,
  Cpu, Activity, Lock
} from 'lucide-react';

const NetworkPresentation = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState('materi');

  // Konten dipisahkan agar mudah di-maintenance
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
            <ul className="mt-3 space-y-2 text-slate-600">
              <li>• <strong>Finansial:</strong> Transaksi senilai $2.1 Miliar terhenti.</li>
              <li>• <strong>Logistik:</strong> Ribuan kapal kontainer kehilangan data manifes digital.</li>
              <li>• <strong>Sosial:</strong> Isolasi informasi memicu kepanikan massal.</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-1 italic text-sm underline">Visual Hook</h4>
              <p className="text-xs text-slate-500 italic">"Gunakan slide ini untuk menceritakan betapa rapuhnya ketergantungan kita pada protokol komunikasi."</p>
            </div>
          </div>
        </div>
      )
    },
    hardware: {
      title: "Anatomi Perangkat Keras Jaringan",
      icon: <Cpu className="text-blue-500" />,
      body: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                   <HardDrive size={18} /> Switch (L2 Device)
                </h3>
                <p className="text-sm text-slate-600">Menghubungkan komputer dalam satu local network (LAN) menggunakan MAC Address.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition">
                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                   <Network size={18} /> Router (L3 Device)
                </h3>
                <p className="text-sm text-slate-600">Menentukan jalur terbaik antar network yang berbeda menggunakan IP Address.</p>
              </div>
            </div>
            <div className="bg-slate-900 text-slate-300 p-6 rounded-xl border-4 border-slate-800">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2 italic">
                <PlayCircle className="text-blue-400" /> Demo Visual: Kabel RJ45
              </h4>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['OW', 'O', 'GW', 'B', 'BW', 'G', 'BrW', 'Br'].map((col, i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded flex items-center justify-center text-[10px] border border-slate-700 font-mono">
                    {col}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-center opacity-70 italic">Standar TIA/EIA-568B: Urutan kabel untuk koneksi jaringan stabil.</p>
            </div>
          </div>
        </div>
      )
    },
    demo_ip: {
      title: "Live Terminal: Cek Identitas Digital",
      icon: <Terminal className="text-emerald-500" />,
      body: (
        <div className="space-y-6">
          <p className="text-slate-600">Di dalam jaringan, perangkat Anda dikenali melalui <strong>IP Address</strong>. Cobalah demo perintah di bawah:</p>
          <div className="bg-[#1e1e1e] text-emerald-400 p-6 rounded-lg font-mono shadow-2xl border border-slate-700">
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-500 ml-2">cmd.exe — Mejatika Network Tools</span>
            </div>
            <p className="mb-2 text-slate-400">C:\Users\Visitor&gt; ipconfig /all</p>
            <p className="text-emerald-200">Wireless LAN adapter Wi-Fi:</p>
            <p className="ml-4 text-emerald-500/80 italic">Description . . . . . . : Intel(R) Wi-Fi 6 AX201</p>
            <p className="ml-4 font-bold">IPv4 Address. . . . . . : 192.168.100.24 (Preferred)</p>
            <p className="ml-4">Subnet Mask . . . . . . : 255.255.255.0</p>
            <p className="ml-4 text-rose-400">Default Gateway . . . . : 192.168.100.1</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-emerald-800 italic">
            <strong>Analogi:</strong> Default Gateway adalah "Pintu Keluar" rumah Anda menuju dunia luar (Internet).
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
            <h4 className="font-bold text-amber-900 mb-2">HTTP vs HTTPS</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>HTTP (Port 80):</strong> Seperti mengirim surat lewat kartu pos. Siapapun yang memegang kartu bisa membaca isinya.
              <br/><br/>
              <strong>HTTPS (Port 443):</strong> Seperti mengirim surat dalam brankas baja bersandi. Hanya penerima yang punya kunci untuk membukanya.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 border border-slate-200 rounded-lg shadow-sm">
                <Shield className="mb-2 text-rose-500" />
                <h5 className="font-bold">Firewall</h5>
                <p className="text-xs text-slate-500 text-justify">Penyaring trafik data berdasarkan aturan keamanan (Port blocking, IP Filtering).</p>
             </div>
             <div className="p-4 border border-slate-200 rounded-lg shadow-sm">
                <Network className="mb-2 text-blue-500" />
                <h5 className="font-bold">VPN</h5>
                <p className="text-xs text-slate-500 text-justify">Menciptakan "Tunnel" terenkripsi di atas jaringan publik.</p>
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
            { q: "Mengapa Wi-Fi penuh tapi internet lambat?", a: "Sinyal Wi-Fi (bar) menunjukkan koneksi ke router. Internet lambat biasanya terjadi karena kemacetan di ISP atau 'bandwidth' yang habis." },
            { q: "Aman tidak pakai Wi-Fi publik?", a: "Sangat berisiko! Tanpa VPN, hacker bisa melakukan 'Sniffing' (mencuri paket data) yang lewat di udara yang sama." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-bold text-indigo-900">Q: {item.q}</h4>
              <p className="text-slate-600 mt-2 text-sm italic">" {item.a} "</p>
            </div>
          ))}
        </div>
      )
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Network size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">MEJATIKA</span>}
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
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
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 text-slate-300">
                  <HardDrive size={20} />
                  {isSidebarOpen && <span className="font-medium">Materi Inti</span>}
                </div>
                {isSidebarOpen && (openSubmenu === 'materi' ? <ChevronDown size={16}/> : <ChevronRight size={16}/>)}
              </button>
              
              {openSubmenu === 'materi' && isSidebarOpen && (
                <ul className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <SubmenuLink 
                    label="Hardware Jaringan" 
                    active={activeTab === 'hardware'} 
                    onClick={() => setActiveTab('hardware')} 
                  />
                  <SubmenuLink 
                    label="Keamanan & SSL" 
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')} 
                  />
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
          className="p-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-all"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              {content[activeTab].icon}
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{content[activeTab].title}</h2>
          </div>
          <div className="hidden md:block">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-widest">
              Network Module
            </span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8fafc]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
              <div className="p-8 md:p-12">
                {content[activeTab].body}
              </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center text-xs text-slate-400 px-2">
              <p>© 2026 Mejatika Digital Education</p>
              <p>Materi Presentasi Interaktif v1.2</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper Components
const SidebarLink = ({ active, onClick, icon, label, isOpen }) => (
  <li>
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {isOpen && <span className="font-medium text-sm tracking-wide">{label}</span>}
    </button>
  </li>
);

const SubmenuLink = ({ label, active, onClick }) => (
  <li>
    <button 
      onClick={onClick}
      className={`w-full text-left p-2.5 text-xs rounded-lg transition-all ${
        active ? 'text-blue-400 font-bold bg-blue-400/10' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      • {label}
    </button>
  </li>
);

export default NetworkPresentation;
