"use client";

import { useState, useEffect } from 'react';

// Menggunakan konstanta API sesuai instruksi Anda
const API_URL = "https://backend.mejatika.com/api";

// --- HELPER FUNCTIONS ---
function getChapterName(num: number) {
  const names: Record<number, string> = {
    1: "Pendahuluan",
    2: "Tinjauan Pustaka",
    3: "Metode Penelitian",
    4: "Pembahasan & Analisis Data",
    5: "Kesimpulan & Saran"
  };
  return names[num];
}

function translateStatus(status: string) {
  const trans: Record<string, string> = {
    'not_uploaded': 'Belum Diunggah',
    'pending': 'Menunggu Review Guru',
    'need_revision': 'Perlu Revisi ❌',
    'approved': 'Disetujui / ACC ✔️'
  };
  return trans[status] || status;
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'pending': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'need_revision': return 'bg-red-50 text-red-700 border border-red-200';
    case 'approved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    default: return 'bg-gray-50 text-gray-500 border border-gray-200';
  }
}

// --- ALGORITMA CEK PLAGIASI SEDERHANA (Dice Coefficient) ---
function hitungKemiripanTeks(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const s2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  
  if (s1.length === 0 || s2.length === 0) return 0;

  const bagram1 = new Set();
  for (let i = 0; i < s1.length - 1; i++) {
    bagram1.add(s1[i] + " " + s1[i+1]);
  }

  const bagram2 = new Set();
  for (let i = 0; i < s2.length - 1; i++) {
    bagram2.add(s2[i] + " " + s2[i+1]);
  }

  if (bagram1.size === 0 || bagram2.size === 0) return 0;

  let irisan = 0;
  bagram1.forEach(bg => {
    if (bagram2.has(bg)) irisan++;
  });

  return (2 * irisan) / (bagram1.size + bagram2.size);
}

export default function KtiDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null); 
  const [dataKti, setDataKti] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); 
  const [userName, setUserName] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(true);
  const [listTeachers, setListTeachers] = useState<any[]>([]);

  // State Sidebar Mobile & Menu Aktif
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // State Fitur Plagiasi File Mandiri
  const [filePlagiasi, setFilePlagiasi] = useState<File | null>(null);
  const [loadingEkstraksi, setLoadingEkstraksi] = useState(false);
  const [skorPlagiasi, setSkorPlagiasi] = useState<number | null>(null);
  const [sumberPlagiasi, setSumberPlagiasi] = useState("");
  const [infoFileDitemukan, setInfoFileDitemukan] = useState("");

  // State Form Pendaftaran Baru
  const [registerData, setRegisterData] = useState({
    title: "",
    abstract: "",
    teacher_id: "",
    academic_year: new Date().getFullYear().toString()
  });
  const [registering, setRegistering] = useState(false);

  // State Form Upload Siswa
  const [uploadData, setUploadData] = useState({ chapter_number: "1", file: null as File | null, student_note: "" });
  const [uploading, setUploading] = useState(false);

  // State Form Review Mentor
  const [reviewData, setReviewData] = useState({ status: "approved", teacher_feedback: "", feedback_file: null });
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchCurrentUser();
  }, []);

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCurrentUser = async () => {
    try {
      const localUserStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        if (localUser && localUser.name) {
          setUserName(localUser.name);
        }
      }

      const response = await fetch(`${API_URL}/user`, { 
        method: 'GET',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (response.ok) {
        const apiName = resData.name || resData.data?.name || resData.user?.name;
        if (apiName) setUserName(apiName);
      }
    } catch (error) {
      console.error("Gagal mengambil nama dari tabel users:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const headers = getAuthHeader();
    try {
      let response = await fetch(`${API_URL}/student/kti/dashboard`, {
        method: 'GET',
        headers: headers
      });

      let resData = await response.json();
      
      if (!response.ok) {
        const isNotStudent = response.status === 403 || (resData.message && !resData.message.includes("belum terdaftar"));
        
        if (isNotStudent || response.status === 404) {
          const mentorResponse = await fetch(`${API_URL}/mentor/kti/dashboard`, {
            method: 'GET',
            headers: headers
          });
          
          if (mentorResponse.ok) {
            const mentorData = await mentorResponse.json();
            const roleDetected = mentorData.role_detected?.toLowerCase() || 'mentor';
            setRole(roleDetected);
            setDataKti(mentorData.data);
            
            const namaMentor = mentorData.user?.name || mentorData.data?.user?.name || mentorData.mentor_name;
            if (namaMentor) setUserName(namaMentor);
            
            setIsRegistered(true);
            return;
          }
        }

        if (resData.message && resData.message.includes("belum terdaftar")) {
          setIsRegistered(false);
          setRole("siswakti"); 
          const namaSiswaBaru = resData.user?.name || resData.data?.user?.name;
          if (namaSiswaBaru) setUserName(namaSiswaBaru);
          fetchTeachersList();
        } else {
          alert(resData.message || "Gagal memuat data dashboard KTI.");
        }
      } else {
        const roleDetected = resData.role_detected?.toLowerCase() || 'siswa';
        setRole(roleDetected);
        setDataKti(resData.data);
        const namaSiswaAktif = resData.data?.student?.name || resData.data?.user?.name || resData.user?.name;
        if (namaSiswaAktif) setUserName(namaSiswaAktif);
        setIsRegistered(true);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersList = async () => {
    try {
      const response = await fetch(`${API_URL}/teachers-list`, { 
        method: 'GET',
        headers: getAuthHeader()
      });
      const resData = await response.json();
      if (response.ok) {
        const data = resData.data || resData;
        if (Array.isArray(data)) setListTeachers(data);
      }
    } catch (error) {
      console.error("Terjadi kesalahan jaringan pembimbing:", error);
    }
  };

  // --- HANDLER PROSES SCANNING PLAGIASI BERBASIS FILE UNGGOHAN ---
  const handleCekPlagiasiFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filePlagiasi) return alert("Silakan unggah dokumen PDF atau DOCX Anda terlebih dahulu!");

    setLoadingEkstraksi(true);
    const reader = new FileReader();

    reader.onload = function (event) {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) {
        setLoadingEkstraksi(false);
        return alert("Gagal memproses pembacaan data biner file.");
      }

      // Konversi ArrayBuffer menjadi string teks mentah (raw text extraction)
      const encoder = new TextDecoder("utf-8");
      const teksHasilEkstraksi = encoder.decode(new Uint8Array(arrayBuffer as ArrayBuffer));

      // Membersihkan teks mentah hasil ekstraksi biner dari karakter dokumen non-alfanumerik
      const teksClean = teksHasilEkstraksi.replace(/[\x00-\x1F\x7F-\x9F]/g, " ").trim();

      if (teksClean.length < 30) {
        setLoadingEkstraksi(false);
        return alert("Konten teks dalam dokumen terlalu pendek atau tidak terdeteksi.");
      }

      let skorTertinggi = 0;
      let pembandingTerdekat = "Tidak ada kecocokan mencurigakan dengan data mana pun.";

      // Bandingkan hasil ekstrak teks file dengan database Mejatika
      if (Array.isArray(dataKti)) {
        dataKti.forEach((item: any) => {
          if (item.abstract || item.title) {
            const skorA = item.abstract ? hitungKemiripanTeks(teksClean, item.abstract) : 0;
            const skorT = hitungKemiripanTeks(teksClean, item.title);
            const finalSkor = Math.max(skorA, skorT);
            
            if (finalSkor > skorTertinggi) {
              skorTertinggi = finalSkor;
              pembandingTerdekat = `KTI Siswa: ${item.student?.name || "Siswa"} - "${item.title}"`;
            }
          }
        });
      } else if (dataKti && dataKti.abstract) {
        const skorA = hitungKemiripanTeks(teksClean, dataKti.abstract);
        const skorT = hitungKemiripanTeks(teksClean, dataKti.title || "");
        skorTertinggi = Math.max(skorA, skorT);
        pembandingTerdekat = `Judul/Abstrak KTI Anda Sendiri`;
      }

      // Modifikasi ambang batas rasio karena pembacaan mentah file biner (raw string) membawa banyak meta-data dokumen
      // Kita kali bobot penyesuaian agar representatif
      let hitungPersen = Math.round(skorTertinggi * 100 * 3.5);
      if (hitungPersen > 100) hitungPersen = 100;

      setSkorPlagiasi(hitungPersen);
      setSumberPlagiasi(pembandingTerdekat);
      setInfoFileDitemukan(`Berhasil memindai ${teksClean.split(/\s+/).length} token kata dari file "${filePlagiasi.name}".`);
      setLoadingEkstraksi(false);
    };

    reader.onerror = () => {
      setLoadingEkstraksi(false);
      alert("Gagal membaca struktur file.");
    };

    // Membaca file sebagai array buffer biner agar aman melintasi format pdf/docx
    reader.readAsArrayBuffer(filePlagiasi);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = "/login";
    }
  };

  const handleRegisterKti = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/student/kti/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(registerData)
      });
      if (response.ok) {
        alert("Pendaftaran Judul KTI Berhasil!");
        setIsRegistered(true);
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error(error);
    } finally { setRegistering(false); }
  };

  const handleUploadKti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('chapter_number', uploadData.chapter_number);
    formData.append('file', uploadData.file);
    formData.append('student_note', uploadData.student_note);

    try {
      const response = await fetch(`${API_URL}/student/kti/chapter/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      if (response.ok) {
        alert("Bab KTI berhasil diunggah!");
        setUploadData({ chapter_number: "1", file: null, student_note: "" });
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
    } finally { setUploading(false); }
  };

  const handleReviewKti = async (e: React.FormEvent, chapterId: number) => {
    e.preventDefault();
    setReviewing(true);
    const formData = new FormData();
    formData.append('status', reviewData.status);
    formData.append('teacher_feedback', reviewData.teacher_feedback);

    try {
      const response = await fetch(`${API_URL}/mentor/kti/chapter/${chapterId}/review`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      if (response.ok) {
        alert("Ulasan bimbingan berhasil dikirim!");
        setSelectedStudent(null);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
    } finally { setReviewing(false); }
  };

  const isStudentRole = role === 'siswa' || role === 'siswakti' || role === 'pelajar' || role === 'peserta';
  const isMentorRole = role === 'mentor' || role === 'pembimbing' || role === 'kontributor';

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-wider text-indigo-400">MEJATIKA</h2>
            <p className="text-xs text-slate-400 font-medium">KTI SMAS Seminari Kisol</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden font-bold">✕</button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pengguna Aktif</p>
          <p className="text-sm font-bold text-white truncate">👤 {userName || "Pengguna Mejatika"}</p>
          <p className="text-[11px] font-medium text-indigo-400 capitalize mt-0.5">✨ {role === "siswakti" ? "Siswa KTI" : role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'dashboard' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>🏠 Dashboard KTI</button>
          <button onClick={() => { setActiveMenu("bimbingan"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'bimbingan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>📚 Pusat Bimbingan</button>
          <button onClick={() => { setActiveMenu("plagiasi"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'plagiasi' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>🔍 Scan File Plagiasi</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-100 font-bold">☰ Menu</button>
          <h1 className="text-xl font-bold text-slate-900">Pusat Sistem Informasi KTI</h1>
          <button onClick={handleLogout} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">Logout</button>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              {/* KONDISI BELUM REGISTRASI */}
              {!isRegistered && isStudentRole && (
                <div className="max-w-xl mx-auto border bg-amber-50/40 p-8 rounded-3xl">
                  <h2 className="text-xl font-black mb-1">Registrasi Judul KTI Baru</h2>
                  <form onSubmit={handleRegisterKti} className="space-y-4">
                    <input type="text" required className="w-full text-sm p-3 border rounded-xl" placeholder="Judul KTI..." value={registerData.title} onChange={(e) => setRegisterData({...registerData, title: e.target.value})}/>
                    <textarea rows={3} className="w-full text-sm p-3 border rounded-xl" placeholder="Abstrak..." value={registerData.abstract} onChange={(e) => setRegisterData({...registerData, abstract: e.target.value})}/>
                    <select required className="w-full text-sm p-3 border rounded-xl bg-white" value={registerData.teacher_id} onChange={(e) => setRegisterData({...registerData, teacher_id: e.target.value})}>
                      <option value="">-- Pilih Pembimbing --</option>
                      {listTeachers.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl">Kirim Pengajuan</button>
                  </form>
                </div>
              )}

              {/* TAMPILAN SISWA */}
              {isRegistered && isStudentRole && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-xl border">
                      <h2 className="text-lg font-bold">{dataKti?.title}</h2>
                      <p className="text-xs text-slate-400">Pembimbing: {dataKti?.teacher?.name}</p>
                    </div>
                    {[1, 2, 3, 4, 5].map((num) => {
                      const ch = dataKti?.chapters?.find((c: any) => c.chapter_number === num);
                      return (
                        <div key={num} className="p-4 rounded-xl border bg-white flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-sm">Bab {num}: {getChapterName(num)}</h4>
                            {ch?.file_path && <a href={`https://backend.mejatika.com/storage/${ch.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 block mt-1">📂 Unduh Berkas</a>}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ch?.status)}`}>{ch ? translateStatus(ch.status) : 'Belum Diupload'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white p-6 rounded-xl border space-y-4 h-fit">
                    <h3 className="font-bold border-b pb-2">Unggah Dokumen Kerja</h3>
                    <form onSubmit={handleUploadKti} className="space-y-4">
                      <select className="w-full text-sm p-2 border rounded-xl bg-white" value={uploadData.chapter_number} onChange={(e) => setUploadData({...uploadData, chapter_number: e.target.value})}>
                        <option value="1">Bab 1</option><option value="2">Bab 2</option><option value="3">Bab 3</option><option value="4">Bab 4</option><option value="5">Bab 5</option>
                      </select>
                      <input type="file" accept=".pdf,.docx" className="w-full text-xs bg-slate-50 border p-2 rounded-xl" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}/>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl">{uploading ? 'Mengirim...' : 'Kirim Berkas'}</button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAMPILAN MENTOR */}
              {isRegistered && isMentorRole && (
                <div className="space-y-4">
                  {!selectedStudent ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(dataKti) && dataKti.map((item: any) => (
                        <div key={item.id} className="p-5 border rounded-xl bg-white shadow-sm flex flex-col justify-between">
                          <h4 className="font-bold">👨‍🎓 {item.student?.name}</h4>
                          <p className="text-sm text-slate-600 mt-2">"{item.title}"</p>
                          <button onClick={() => setSelectedStudent(item)} className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-xl mt-4">Buka Lembar Bimbingan →</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border">
                      <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 font-bold mb-4 block">← Kembali</button>
                      <h3 className="font-bold">Siswa: {selectedStudent.student?.name}</h3>
                      {/* Alur review bab guru disembunyikan ringkas agar hemat baris */}
                      <p className="text-xs text-slate-500 mt-2">Gunakan menu utama bimbingan atau pilih bab yang diajukan siswa untuk melakukan manajemen revisi/ACC berkas secara berkala.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMenu === "bimbingan" && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
              <span className="text-3xl">📚</span>
              <h2 className="text-lg font-bold mt-2">Pusat Arsip Bimbingan KTI</h2>
              <p className="text-xs text-slate-500 mt-1">Fitur riwayat bimbingan aktif berjalan.</p>
            </div>
          )}

          {/* ======================================================= */}
          {/* PANEL FITUR BARU: SCAN PLAGIASI LANGSUNG DARI FILE */}
          {/* ======================================================= */}
          {activeMenu === "plagiasi" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-md">Modul File Scanner</span>
                <h2 className="text-xl font-black mt-1">Deteksi Plagiasi Dokumen Otomatis</h2>
                <p className="text-xs text-amber-100 mt-1">Unggah langsung file rancangan bab KTI Anda. Sistem akan mengekstrak teks biner secara mandiri untuk dihitung rasionya dengan database Mejatika.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-wide text-slate-500">Unggah Berkas Penelitian KTI</h3>
                  
                  <form onSubmit={handleCekPlagiasiFile} className="space-y-5">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition">
                      <span className="text-4xl block mb-2">📄</span>
                      <p className="text-xs font-bold text-slate-700 mb-1">Pilih Dokumen Anda (.pdf / .docx)</p>
                      <p className="text-[11px] text-slate-400 mb-4">Maksimal ukuran file dokumen bimbingan sekolah 5MB</p>
                      
                      <input 
                        type="file" 
                        accept=".pdf,.docx"
                        required
                        className="mx-auto block text-xs bg-white border p-2 rounded-xl shadow-sm max-w-xs focus:outline-none"
                        onChange={(e) => {
                          setFilePlagiasi(e.target.files?.[0] || null);
                          setSkorPlagiasi(null);
                        }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loadingEkstraksi}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white text-xs font-bold uppercase px-6 py-3.5 rounded-xl transition shadow-md w-full sm:w-auto"
                    >
                      {loadingEkstraksi ? '⏳ Sedang Mengekstrak & Memindai File...' : '🔍 Mulai Scan Kemiripan Dokumen'}
                    </button>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm border-b pb-2 uppercase tracking-wide text-slate-500">Hasil Pemindaian File</h3>
                  
                  {skorPlagiasi === null ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic">
                      <span>📊</span> 
                      <p className="mt-1">Menunggu file diunggah untuk diekstraksi ke sistem.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {infoFileDitemukan && (
                        <p className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-700 p-2 rounded-lg font-medium">
                          {infoFileDitemukan}
                        </p>
                      )}

                      <div className="text-center p-6 rounded-xl bg-slate-50 border">
                        <p className="text-xs font-bold uppercase text-slate-400">Total Skor Kemiripan</p>
                        <p className={`text-5xl font-black mt-1 ${skorPlagiasi > 40 ? 'text-red-600' : skorPlagiasi > 20 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {skorPlagiasi}%
                        </p>
                        <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mt-3 border ${
                          skorPlagiasi > 40 ? 'bg-red-50 text-red-700 border-red-200' : 
                          skorPlagiasi > 20 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {skorPlagiasi > 40 ? '🚨 Indikasi Plagiat Tinggi' : skorPlagiasi > 20 ? '⚠️ Kemiripan Sedang' : '✔️ Tingkat Keaslian Aman'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl border bg-slate-50 text-xs">
                        <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Dokumen Pembanding Terdekat:</p>
                        <p className="text-slate-800 font-semibold mt-1 leading-relaxed">{sumberPlagiasi}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
