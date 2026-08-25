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

export default function KtiDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null); // 'siswa', 'siswakti', 'mentor', atau 'pembimbing'
  const [dataKti, setDataKti] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); 
  const [userName, setUserName] = useState<string | null>(null);
  // State Deteksi Pendaftaran
  const [isRegistered, setIsRegistered] = useState(true);
  const [listTeachers, setListTeachers] = useState<any[]>([]);

  // State Sidebar Mobile & Menu Aktif
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard"); // 'dashboard' atau 'bimbingan'

  // State Form Pendaftaran Baru (Jika Belum Terdaftar)
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
    fetchCurrentUser(); // <-- Memanggil fungsi pengambil data dari tabel users
  }, []);

  // 3. Ambil token dari localStorage
  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Ditambahkan agar format request konsisten
    };
  };

  const fetchCurrentUser = async () => {
    try {
      // 1. Ambil nama langsung dari objek user lokal sebagai respon pertama (Anti-delay)
      const localUserStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        if (localUser && localUser.name) {
          setUserName(localUser.name);
        }
      }

      // 2. Tetap jalankan sinkronisasi data terbaru dari database
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
            
            // Integrasi parsing nama mentor
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
        
        // Integrasi parsing nama siswa aktif
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
      setListTeachers([
        { id: 2, name: "Roni Haryanto", status: "active" },
        { id: 4, name: "Hironimus Haryanto", status: "active" }
      ]);
    }
  };

  // --- HANDLER OUT: Keluar dari Aplikasi ---
  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert("Anda telah berhasil logout.");
      window.location.href = "/login";
    }
  };

  // --- HANDLER SISWA: Kirim Pendaftaran KTI Baru ---
  const handleRegisterKti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.title || !registerData.teacher_id) {
      return alert("Judul KTI dan Guru Pembimbing wajib diisi!");
    }

    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/student/kti/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(registerData)
      });
      const resData = await response.json();
      if (response.ok) {
        alert("Pendaftaran Judul KTI Berhasil!");
        setIsRegistered(true);
        fetchDashboardData(); 
      } else {
        alert(resData.message || "Gagal melakukan pendaftaran.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat mendaftar.");
    } finally {
      setRegistering(false);
    }
  };

  // --- HANDLER SISWA: Unggah Berkas KTI ---
  const handleUploadKti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return alert("Silakan pilih file PDF/Docx terlebih dahulu.");

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
      const resData = await response.json();
      if (response.ok) {
        alert("Bab KTI berhasil diunggah!");
        setUploadData({ chapter_number: "1", file: null, student_note: "" });
        fetchDashboardData();
      } else {
        alert(resData.message || "Gagal mengunggah file KTI.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLER MENTOR: Kirim Hasil Review ---
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
      const resData = await response.json();
      if (response.ok) {
        alert("Ulasan bimbingan berhasil dikirim ke siswa!");
        setReviewData({ status: "approved", teacher_feedback: "", feedback_file: null });
        setSelectedStudent(null);
        fetchDashboardData();
      } else {
        alert(resData.message || "Gagal mengirim ulasan bimbingan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat mengirim ulasan.");
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-slate-600 animate-pulse font-medium">Memuat Fitur Bimbingan KTI...</p>
      </div>
    );
  }

  const isStudentRole = role === 'siswa' || role === 'siswakti' || role === 'pelajar' || role === 'peserta';
  const isMentorRole = role === 'mentor' || role === 'pembimbing' || role === 'kontributor';

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">
      
      {/* ======================================================= */}
      {/* SIDEBAR NAVIGATION (RESPONSIVE) */}
      {/* ======================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl`}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-wider text-indigo-400">MEJATIKA</h2>
            <p className="text-xs text-slate-400 font-medium">Karya Tulis Ilmiah SMAS Seminari Pius XII Kisol</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden text-xl font-bold">
            ✕
          </button>
        </div>

        {/* Profil Akun Ringkas */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Pengguna Aktif
          </p>
          <p className="text-sm font-bold text-white truncate" title={userName || "Pengguna"}>
            👤 {userName || "Pengguna Mejatika"}
          </p>
          <p className="text-[11px] font-medium text-indigo-400 capitalize mt-0.5 flex items-center gap-1">
            <span>✨</span> 
            {role === "siswakti" || role === "peserta" ? "Siswa KTI" : role || "Pengguna"}
          </p>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'dashboard' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}
          >
            <span>🏠</span> Dashboard KTI
          </button>
          
          <button 
            onClick={() => { setActiveMenu("bimbingan"); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'bimbingan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}
          >
            <span>📚</span> Pusat Bimbingan
          </button>
        </nav>

        {/* Bagian Tombol Logout Bawah */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-red-900/40 text-red-400 border border-red-900/60 hover:bg-red-600 hover:text-white transition"
          >
            <span>🚪</span> Keluar Akun (Logout)
          </button>
        </div>
      </aside>

      {/* ======================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* TOP NAVBAR (MOBILE & GLOBAL ACTIONS) */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              ☰ Menu
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pusat Bimbingan KTI Per Bab</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Akses Sistem Informasi Karya Tulis Ilmiah Eksklusif Mejatika Sanpio</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition"
          >
            Logout
          </button>
        </header>

        {/* BODY PANEL CONTENT */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          
          {activeMenu === "dashboard" ? (
            <div className="space-y-6">
              
              {/* KONDISI BELUM REGISTRASI JUDUL (KHUSUS SISWA BARU) */}
              {!isRegistered && isStudentRole && (
                <div className="max-w-xl mx-auto border border-amber-200 bg-amber-50/40 p-8 rounded-3xl shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-1 uppercase italic">Registrasi Judul KTI Baru</h2>
                  <p className="text-xs text-slate-500 mb-6">Anda belum terdaftar dalam sistem bimbingan. Selesaikan form di bawah ini untuk memulai akses bimbingan.</p>
                  
                  <form onSubmit={handleRegisterKti} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Judul Lengkap KTI</label>
                      <input 
                        type="text" required
                        className="w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Contoh: Analisis Metode Enkripsi Data Pada Jaringan Sistem..."
                        value={registerData.title}
                        onChange={(e) => setRegisterData({...registerData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Abstrak Singkat</label>
                      <textarea 
                        rows={3}
                        className="w-full text-sm p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Tulis ringkasan gambaran umum karya tulis penelitian Anda..."
                        value={registerData.abstract}
                        onChange={(e) => setRegisterData({...registerData, abstract: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Guru Pembimbing</label>
                        <select 
                          required className="w-full text-sm p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                          value={registerData.teacher_id}
                          onChange={(e) => setRegisterData({...registerData, teacher_id: e.target.value})}
                        >
                          <option value="">-- Pilih Pembimbing --</option>
                          {listTeachers.map((teacher: any) => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tahun Akademik</label>
                        <input type="text" disabled className="w-full text-sm p-3 border rounded-xl bg-slate-100 text-slate-400" value={registerData.academic_year}/>
                      </div>
                    </div>
                    <button type="submit" disabled={registering} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase py-3.5 rounded-xl transition disabled:bg-slate-300">
                      {registering ? 'Memproses Pendaftaran...' : 'Kirim Pengajuan Judul'}
                    </button>
                  </form>
                </div>
              )}

              {/* INTERFACE TAMPILAN SISWA (SUDAH REGISTER) */}
              {isRegistered && isStudentRole && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded">Informasi Penelitian</span>
                      <h2 className="text-lg font-bold text-slate-900 mt-2 mb-1">{dataKti?.title}</h2>
                      <p className="text-xs text-slate-400 mb-3">Tahun Akademik: {dataKti?.academic_year} | Pembimbing: {dataKti?.teacher?.name}</p>
                      <div className="p-3 bg-slate-50 border rounded text-xs text-slate-600 italic">
                        "{dataKti?.abstract || 'Belum ada abstrak data.'}"
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 pt-2">Progress Status 5 Bab KTI</h3>
                    {[1, 2, 3, 4, 5].map((num) => {
                      const ch = dataKti?.chapters?.find((c: any) => c.chapter_number === num);
                      return (
                        <div key={num} className="p-4 rounded-xl border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                          <div>
                            <h4 className="font-semibold text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h4>
                            <p className="text-xs text-slate-400">Versi: {ch?.current_version || 'Belum ada'}</p>
                            {ch?.file_path && (
                              <a href={`https://backend.mejatika.com/storage/${ch.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline block mt-1">
                                📂 Unduh Lembar Berkas Kerja
                              </a>
                            )}
                            {ch?.teacher_feedback && (
                              <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2 rounded border border-amber-200">
                                <strong>Catatan Koreksi Mentor:</strong> {ch.teacher_feedback}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ch?.status)}`}>
                            {ch ? translateStatus(ch.status) : 'Belum Diupload'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-4">
                    <h3 className="font-bold text-slate-900 border-b pb-2">Unggah Dokumen Kerja KTI</h3>
                    <form onSubmit={handleUploadKti} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Target Pengumpulan Bab</label>
                        <select className="w-full text-sm p-2 border rounded-xl bg-white" value={uploadData.chapter_number} onChange={(e) => setUploadData({...uploadData, chapter_number: e.target.value})}>
                          <option value="1">Bab 1: Pendahuluan</option>
                          <option value="2">Bab 2: Tinjauan Pustaka</option>
                          <option value="3">Bab 3: Metode Penelitian</option>
                          <option value="4">Bab 4: Pembahasan & Analisis</option>
                          <option value="5">Bab 5: Kesimpulan & Saran</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Berkas Kerja (PDF/Docx)</label>
                        <input type="file" accept=".pdf,.docx" className="w-full text-xs bg-slate-50 border p-2 rounded-xl" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Pesan Tambahan ke Mentor</label>
                        <textarea rows={3} className="w-full text-sm p-2 border rounded-xl" placeholder="Catatan perbaikan tambahan..." value={uploadData.student_note} onChange={(e) => setUploadData({...uploadData, student_note: e.target.value})}></textarea>
                      </div>
                      <button type="submit" disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl transition disabled:bg-slate-400">
                        {uploading ? 'Mengirim data...' : 'Kirim Pengajuan Bab'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* INTERFACE TAMPILAN GURU/MENTOR */}
              {isRegistered && isMentorRole && (
                <div className="space-y-6">
                  <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-md">
                        Status Akun: Pembimbing
                      </span>
                      <h2 className="text-xl font-black mt-2">Daftar Karya Tulis Ilmiah (KTI) Siswa</h2>
                      <p className="text-xs text-indigo-200 mt-1">
                        Manajemen evaluasi berkas, ulasan, serta persetujuan (ACC) lembar kerja siswa bimbingan Anda.
                      </p>
                    </div>
                    <div className="bg-white/10 px-5 py-3 rounded-xl border border-white/10 text-center min-w-[140px]">
                      <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider">Total Bimbingan</p>
                      <p className="text-3xl font-black mt-0.5">{Array.isArray(dataKti) ? dataKti.length : 0} Siswa</p>
                    </div>
                  </div>

                  {!selectedStudent ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Siswa yang Sedang Dibimbing:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(dataKti) && dataKti.length > 0 ? (
                            dataKti.map((item: any) => (
                              <span key={item.id} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border flex items-center gap-1.5">
                                👤 {item.student?.name || "Siswa tanpa nama"}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum ada siswa bimbingan yang terdaftar.</span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide text-slate-500 pt-2">
                        Silakan Pilih Dokumen Berkas Kerja Siswa:
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(dataKti) && dataKti.map((item: any) => (
                          <div key={item.id} className="p-5 border rounded-xl bg-white shadow-sm hover:border-indigo-300 transition flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                                  <span>👨‍🎓</span> {item.student?.name}
                                </h4>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  Aktif Terdaftar
                                </span>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-dashed border-slate-100">
                                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Judul KTI yang Dibimbing:</p>
                                <p className="text-sm font-semibold text-slate-700 mt-1 leading-relaxed line-clamp-3 bg-slate-50 p-2 rounded-lg border">
                                  "{item.title}"
                                </p>
                              </div>
                              {item.academic_year && (
                                <p className="text-[10px] text-slate-400 mt-2">Tahun Ajaran KTI: {item.academic_year}</p>
                              )}
                            </div>
                            
                            <button onClick={() => setSelectedStudent(item)} className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl mt-4 transition shadow-sm">
                              Buka Lembar Bimbingan Per Bab →
                            </button>
                          </div>
                        ))}
                        {(!dataKti || dataKti.length === 0) && (
                          <p className="text-sm text-slate-400 italic bg-white p-6 rounded-xl border text-center col-span-2">
                            Belum ada siswa terdaftar dalam bimbingan Anda saat ini.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 font-bold hover:underline mb-2 flex items-center gap-1">
                        ← Kembali ke Daftar Siswa
                      </button>
                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-base text-slate-900">Siswa: {selectedStudent.student?.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Judul KTI: {selectedStudent.title}</p>
                      </div>

                      <h4 className="font-bold text-slate-900 pt-2">Daftar Bab & Form Penilaian Koreksi</h4>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const ch = selectedStudent.chapters?.find((c: any) => c.chapter_number === num);
                          const fileUrl = ch?.file_path ? `https://backend.mejatika.com/storage/${ch.file_path}` : null;
                          const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

                          return (
                            <div key={num} className="p-5 border rounded-xl bg-white flex flex-col gap-4 shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <h5 className="font-bold text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h5>
                                  <p className="text-xs text-slate-400">Versi: {ch?.current_version || 'Belum Anda'}</p>
                                  {fileUrl && (
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline block mt-1">
                                      📥 Unduh Lampiran Berkas Siswa
                                    </a>
                                  )}
                                  {ch?.student_note && <p className="text-xs text-slate-500 mt-1 italic">"Pesan siswa: {ch.student_note}"</p>}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(ch?.status)}`}>
                                    {ch ? translateStatus(ch.status) : 'Kosong'}
                                  </span>
                                  
                                  {ch && ch.status === 'pending' && (
                                    <div className="bg-slate-50 p-4 rounded-xl border w-full md:w-80 text-xs">
                                      <form onSubmit={(e) => handleReviewKti(e, ch.id)} className="space-y-2">
                                        <div>
                                          <label className="block font-semibold mb-0.5">Status Persetujuan</label>
                                          <select className="w-full p-1.5 border rounded bg-white text-xs" value={reviewData.status} onChange={(e) => setReviewData({...reviewData, status: e.target.value})}>
                                            <option value="approved">ACC (Setujui Bab)</option>
                                            <option value="need_revision">Minta Revisi Berkas</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block font-semibold mb-0.5">Catatan Masukan Koreksi</label>
                                          <textarea className="w-full p-1.5 border rounded bg-white text-xs" rows={2} placeholder="Tulis instruksi koreksi..." value={reviewData.teacher_feedback} onChange={(e) => setReviewData({...reviewData, teacher_feedback: e.target.value})} required></textarea>
                                        </div>
                                        <button type="submit" disabled={reviewing} className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                                          {reviewing ? 'Memproses...' : 'Kirim Ulasan Penilaian'}
                                        </button>
                                      </form>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {fileUrl && (
                                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50">
                                  <div className="bg-slate-100 px-4 py-2 border-b flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                      🖥️ Live Preview Dokumen Bab {num}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <a 
                                        href={fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-[10px] bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-2 py-1 rounded border shadow-sm transition"
                                      >
                                        ↗️ Buka di Tab Baru
                                      </a>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {isPdf ? "Format: PDF Native" : "Format: Word File"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-full h-[450px] bg-white">
                                    {isPdf ? (
                                      <iframe 
                                        src={fileUrl} 
                                        className="w-full h-full" 
                                        title={`Preview PDF Bab ${num}`}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center bg-slate-50">
                                        <span className="text-4xl mb-2 animate-bounce">📄</span>
                                        <p className="text-xs font-bold text-slate-700">Dokumen Berformat Microsoft Word (.docx)</p>
                                        <p className="text-[11px] text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                                          Kebijakan keamanan sistem membatasi pratinjau langsung ekstensi Word di dalam frame halaman ini.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <a 
                                            href={fileUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                                          >
                                            Unduh / Lihat File Asli
                                          </a>
                                          <a 
                                            href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-white hover:bg-slate-100 text-slate-700 border text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                                          >
                                            Coba Paksa Buka di Google Web
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
              <span className="text-3xl">📚</span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">Pusat Arsip Bimbingan KTI</h2>
              <p className="text-xs text-slate-500 mt-1">Gunakan tab menu utama navigasi di sebelah kiri untuk mengelola aktivitas bimbingan penuh.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
