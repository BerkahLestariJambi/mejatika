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
  const [role, setRole] = useState<string | null>(null); 
  const [dataKti, setDataKti] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); 
  const [userName, setUserName] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(true);
  const [listTeachers, setListTeachers] = useState<any[]>([]);

  // State Sidebar Mobile & Menu Aktif
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard"); 

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
    } resolve: finally {
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
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-wider text-indigo-400">MEJATIKA</h2>
            <p className="text-xs text-slate-400 font-medium">KTI SMAS Seminari Kisol</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden text-xl font-bold">✕</button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pengguna Aktif</p>
          <p className="text-sm font-bold text-white truncate">👤 {userName || "Pengguna Mejatika"}</p>
          <p className="text-[11px] font-medium text-indigo-400 capitalize mt-0.5">✨ {role === "siswakti" ? "Siswa KTI" : role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'dashboard' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>🏠 Dashboard KTI</button>
          <button onClick={() => { setActiveMenu("bimbingan"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'bimbingan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>📚 Pusat Bimbingan</button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-100 font-bold">☰ Menu</button>
            <h1 className="text-xl font-bold text-slate-900">Pusat Bimbingan KTI Per Bab</h1>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">Logout</button>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {activeMenu === "dashboard" ? (
            <div className="space-y-6">
              
              {/* INTERFACE TAMPILAN SISWA */}
              {isRegistered && isStudentRole && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h2 className="text-lg font-bold text-slate-900">{dataKti?.title}</h2>
                      <p className="text-xs text-slate-400">Pembimbing: {dataKti?.teacher?.name}</p>
                    </div>

                    {[1, 2, 3, 4, 5].map((num) => {
                      const ch = dataKti?.chapters?.find((c: any) => c.chapter_number === num);
                      return (
                        <div key={num} className="p-4 rounded-xl border bg-white flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                          <div>
                            <h4 className="font-semibold text-sm">Bab {num}: {getChapterName(num)}</h4>
                            {ch?.file_path && <a href={`https://backend.mejatika.com/storage/${ch.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 block mt-1">📂 Unduh Berkas</a>}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ch?.status)}`}>{ch ? translateStatus(ch.status) : 'Belum Diupload'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-4">
                    <h3 className="font-bold text-slate-900 border-b pb-2">Unggah Dokumen Kerja</h3>
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

              {/* INTERFACE TAMPILAN GURU / MENTOR (LIVE PREVIEW DIRECT) */}
              {isRegistered && isMentorRole && (
                <div className="space-y-4">
                  {!selectedStudent ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(dataKti) && dataKti.map((item: any) => (
                        <div key={item.id} className="p-5 border rounded-xl bg-white shadow-sm flex flex-col justify-between">
                          <h4 className="font-bold">👨‍🎓 {item.student?.name}</h4>
                          <p className="text-sm text-slate-600 mt-2">"{item.title}"</p>
                          <button onClick={() => setSelectedStudent(item)} className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl mt-4">Buka Lembar Bimbingan →</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 font-bold mb-2 block">← Kembali ke Daftar Siswa</button>
                      <div className="bg-white p-4 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-base">Siswa: {selectedStudent.student?.name}</h3>
                        <p className="text-xs text-slate-500">Judul: {selectedStudent.title}</p>
                      </div>

                      <h4 className="font-bold text-slate-900 pt-2">Daftar Bab & Evaluasi Berkas Kerja</h4>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const ch = selectedStudent.chapters?.find((c: any) => c.chapter_number === num);
                          const rawFilePath = ch?.file_path ? `https://backend.mejatika.com/storage/${ch.file_path}` : null;
                          
                          // Deteksi format ekstensi file untuk memilih viewer engine yang tepat
                          const isPdf = rawFilePath?.toLowerCase().endsWith('.pdf');

                          // URL Generator Live Preview Instan Tanpa Blokir Keamanan Browser
                          const livePreviewUrl = isPdf 
                            ? rawFilePath 
                            : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawFilePath || '')}`;

                          return (
                            <div key={num} className="p-5 border rounded-xl bg-white flex flex-col gap-4 shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <h5 className="font-bold text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h5>
                                  <p className="text-xs text-slate-400">Versi Dokumen: {ch?.current_version || '1.0'}</p>
                                  {rawFilePath && (
                                    <a href={rawFilePath} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline block mt-1">
                                      📥 Unduh Berkas Dokumen Asli
                                    </a>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(ch?.status)}`}>
                                    {ch ? translateStatus(ch.status) : 'Kosong'}
                                  </span>
                                  
                                  {ch && ch.status === 'pending' && (
                                    <div className="bg-slate-50 p-4 rounded-xl border w-full md:w-80 text-xs">
                                      <form onSubmit={(e) => handleReviewKti(e, ch.id)} className="space-y-2">
                                        <select className="w-full p-1.5 border rounded bg-white text-xs" value={reviewData.status} onChange={(e) => setReviewData({...reviewData, status: e.target.value})}>
                                          <option value="approved">ACC (Setujui Bab)</option>
                                          <option value="need_revision">Minta Revisi Berkas</option>
                                        </select>
                                        <textarea className="w-full p-1.5 border rounded bg-white text-xs" rows={2} placeholder="Tulis instruksi koreksi..." value={reviewData.teacher_feedback} onChange={(e) => setReviewData({...reviewData, teacher_feedback: e.target.value})} required></textarea>
                                        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold hover:bg-indigo-700">Kirim Ulasan</button>
                                      </form>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* --- MODUL LIVE PREVIEW SEKARANG TERBUKA OTOMATIS BERDASARKAN FORMAT FILE --- */}
                              {rawFilePath && (
                                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                                  <div className="bg-slate-100 px-4 py-2.5 border-b flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                      🖥️ Live Preview Dokumen Berkas Aktif (Bab {num})
                                    </span>
                                    <a href={rawFilePath} target="_blank" rel="noreferrer" className="text-[10px] bg-white border font-bold px-2.5 py-1 rounded shadow-sm text-indigo-600 hover:bg-slate-50">
                                      ↗️ Buka Tab Baru
                                    </a>
                                  </div>
                                  
                                  {/* Kontainer iframe langsung memuat konten dokumen */}
                                  <div className="w-full h-[550px] bg-white">
                                    <iframe 
                                      src={livePreviewUrl} 
                                      className="w-full h-full border-none" 
                                      title={`Live Preview Bab ${num}`}
                                      allowFullScreen
                                    />
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
