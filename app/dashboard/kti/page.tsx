"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"
import { renderAsync } from "docx-preview"

const API_URL = "https://backend.mejatika.com/api"

// Helper Nama Bab
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [registerData, setRegisterData] = useState({
    title: "", abstract: "", teacher_id: "", academic_year: new Date().getFullYear().toString()
  });
  const [registering, setRegistering] = useState(false);

  const [uploadData, setUploadData] = useState({ chapter_number: "1", file: null as File | null, student_note: "" });
  const [uploading, setUploading] = useState(false);

  // State Review Per-Bab Independen (Bab 1-5)
  const [chapterReviews, setChapterReviews] = useState<Record<number, { status: string; teacher_feedback: string }>>({});
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState<string | null>(null);
  const docxPreviewRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
        if (localUser && localUser.name) setUserName(localUser.name);
      }
      const response = await fetch(`${API_URL}/user`, { method: 'GET', headers: getAuthHeader() });
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
      let response = await fetch(`${API_URL}/student/kti/dashboard`, { method: 'GET', headers: headers });
      let resData = await response.json();
      
      if (!response.ok) {
        const isNotStudent = response.status === 403 || (resData.message && !resData.message.includes("belum terdaftar"));
        if (isNotStudent || response.status === 404) {
          const mentorResponse = await fetch(`${API_URL}/mentor/kti/dashboard`, { method: 'GET', headers: headers });
          if (mentorResponse.ok) {
            const mentorData = await mentorResponse.json();
            setRole(mentorData.role_detected?.toLowerCase() || 'mentor');
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
          fetchTeachersList();
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: resData.message || "Gagal memuat data." });
        }
      } else {
        setRole(resData.role_detected?.toLowerCase() || 'siswa');
        setDataKti(resData.data);
        const namaSiswa = resData.data?.student?.name || resData.data?.user?.name || resData.user?.name;
        if (namaSiswa) setUserName(namaSiswa);
        setIsRegistered(true);
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Kesalahan Jaringan', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersList = async () => {
    try {
      const response = await fetch(`${API_URL}/teachers-list`, { method: 'GET', headers: getAuthHeader() });
      const resData = await response.json();
      if (response.ok) setListTeachers(Array.isArray(resData.data || resData) ? (resData.data || resData) : []);
    } catch (error) {
      setListTeachers([]);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?', text: "Anda akan keluar dari akun bimbingan ini!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b', confirmButtonText: 'Ya, Keluar!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "/login";
      }
    });
  };

  const handleRegisterKti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.title || !registerData.teacher_id) {
      return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Judul KTI dan Guru Pembimbing wajib diisi!' });
    }
    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/student/kti/register`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(registerData)
      });
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Registrasi Berhasil!' });
        setIsRegistered(true);
        fetchDashboardData(); 
      }
    } finally { setRegistering(false); }
  };

  const handleUploadKti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return Swal.fire({ icon: 'warning', title: 'Berkas Kosong', text: 'Pilih file PDF/Docx.' });
    setUploading(true);
    
    const formData = new FormData();
    formData.append('chapter_number', uploadData.chapter_number);
    formData.append('file', uploadData.file);
    formData.append('student_note', uploadData.student_note);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/student/kti/chapter/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil Diunggah' });
        setUploadData({ chapter_number: "1", file: null, student_note: "" });
        fetchDashboardData();
      }
    } finally { setUploading(false); }
  };

  // Handler Review Bab 1 s/d 5
  const handleReviewKtiPerChapter = async (e: React.FormEvent, chapterId: number, num: number) => {
    e.preventDefault();
    setReviewingId(chapterId);

    const chapterForm = chapterReviews[num] || { status: 'approved', teacher_feedback: '' };
    
    const formData = new FormData();
    formData.append('status', chapterForm.status || 'approved');
    formData.append('teacher_feedback', chapterForm.teacher_feedback || '');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const response = await fetch(`${API_URL}/mentor/kti/chapter/${chapterId}/review`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const resData = await response.json();
      if (response.ok) {
        Swal.fire({ icon: 'success', title: `Bab ${num} Berhasil Diulas!`, text: 'Catatan & status telah diperbarui.' });
        fetchDashboardData();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal Mengirim', text: resData.message || "Gagal mengirim ulasan." });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Kesalahan Sistem', text: 'Gagal terhubung ke server API.' });
    } finally {
      setReviewingId(null);
    }
  };

  const renderDocxPreview = async (fileUrl: string, chapterNumber: number) => {
    const container = docxPreviewRefs.current[chapterNumber];
    if (!container) return;
    setDocxLoading(true); setDocxError(null);
    try {
      container.innerHTML = "";
      const proxyUrl = `/api/docx-preview?url=${encodeURIComponent(fileUrl)}`;
      const response = await fetch(proxyUrl, { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const blob = await response.blob();
      await renderAsync(blob, container, undefined, { inWrapper: true, ignoreWidth: false, breakPages: true });
    } catch (error: any) {
      setDocxError(error?.message || "Gagal menampilkan preview Word.");
    } finally {
      setDocxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <p className="text-slate-600 animate-pulse font-medium">Memuat Fitur Bimbingan KTI...</p>
      </div>
    );
  }

  const isStudentRole = role === 'siswa' || role === 'siswakti' || role === 'pelajar';
  const isMentorRole = role === 'mentor' || role === 'pembimbing';

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-wider text-indigo-400">MEJATIKA</h2>
            <p className="text-xs text-slate-400 font-medium">KTI SMAS Seminari Pius XII Kisol</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden">✕</button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pengguna Aktif</p>
          <p className="text-sm font-bold text-white truncate">👤 {userName || "Pengguna"}</p>
          <p className="text-[11px] font-medium text-indigo-400 capitalize mt-0.5">✨ {role || "Pengguna"}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => { setActiveMenu("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'dashboard' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <span>🏠</span> Dashboard KTI
          </button>
          <button onClick={() => { setActiveMenu("bimbingan"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeMenu === 'bimbingan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>
            <span>📚</span> Pedoman Daftar Pustaka
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white transition">
            🚪 Keluar Akun
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-700 font-bold">☰ Menu</button>
            <h1 className="text-xl font-bold text-slate-900">Pusat Bimbingan KTI Per Bab (Bab 1-5)</h1>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">Logout</button>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {activeMenu === "dashboard" ? (
            <div className="space-y-6">
              {!isRegistered && isStudentRole && (
                <div className="max-w-xl mx-auto border border-amber-200 bg-amber-50/40 p-8 rounded-3xl shadow-sm">
                  <h2 className="text-xl font-black text-slate-900 mb-1">Registrasi Judul KTI Baru</h2>
                  <form onSubmit={handleRegisterKti} className="space-y-4">
                    <input type="text" required className="w-full text-sm p-3 border rounded-xl" placeholder="Judul Lengkap KTI" value={registerData.title} onChange={(e) => setRegisterData({...registerData, title: e.target.value})}/>
                    <textarea rows={3} className="w-full text-sm p-3 border rounded-xl" placeholder="Abstrak Singkat" value={registerData.abstract} onChange={(e) => setRegisterData({...registerData, abstract: e.target.value})}/>
                    <select required className="w-full text-sm p-3 border rounded-xl" value={registerData.teacher_id} onChange={(e) => setRegisterData({...registerData, teacher_id: e.target.value})}>
                      <option value="">-- Pilih Pembimbing --</option>
                      {listTeachers.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                    <button type="submit" disabled={registering} className="w-full bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl">Kirim Pengajuan</button>
                  </form>
                </div>
              )}

              {isRegistered && isStudentRole && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h2 className="text-lg font-bold text-slate-900">{dataKti?.title}</h2>
                      <p className="text-xs text-slate-400">Pembimbing: {dataKti?.teacher?.name}</p>
                    </div>

                    <h3 className="font-bold text-slate-900">Progress Status 5 Bab KTI</h3>
                    {[1, 2, 3, 4, 5].map((num) => {
                      const ch = dataKti?.chapters?.find((c: any) => c.chapter_number === num);
                      return (
                        <div key={num} className="p-4 rounded-xl border bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h4>
                            {ch?.file_path && <a href={`https://backend.mejatika.com/storage/${ch.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 block mt-1">📂 Unduh Berkas</a>}
                            {ch?.teacher_feedback && <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2 rounded"><strong>Catatan Mentor:</strong> {ch.teacher_feedback}</div>}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ch?.status)}`}>{ch ? translateStatus(ch.status) : 'Belum Diupload'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit">
                    <h3 className="font-bold text-slate-900">Unggah Dokumen Bab KTI</h3>
                    <form onSubmit={handleUploadKti} className="space-y-4">
                      <select className="w-full text-sm p-2 border rounded-xl" value={uploadData.chapter_number} onChange={(e) => setUploadData({...uploadData, chapter_number: e.target.value})}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>Bab {n}: {getChapterName(n)}</option>)}
                      </select>
                      <input type="file" accept=".pdf,.docx" className="w-full text-xs bg-slate-50 border p-2 rounded-xl" onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}/>
                      <textarea rows={2} className="w-full text-sm p-2 border rounded-xl" placeholder="Catatan ke mentor..." value={uploadData.student_note} onChange={(e) => setUploadData({...uploadData, student_note: e.target.value})}/>
                      <button type="submit" disabled={uploading} className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl">Kirim Pengajuan Bab</button>
                    </form>
                  </div>
                </div>
              )}

              {isRegistered && isMentorRole && (
                <div className="space-y-6">
                  <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black">Daftar Karya Tulis Ilmiah (KTI) Siswa</h2>
                      <p className="text-xs text-indigo-200 mt-1">Evaluasi dan berikan nilai/revisi untuk Bab 1 sampai Bab 5.</p>
                    </div>
                  </div>

                  {!selectedStudent ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(dataKti) && dataKti.map((item: any) => (
                        <div key={item.id} className="p-5 border rounded-xl bg-white shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-base">👨‍🎓 {item.student?.name}</h4>
                            <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded border">"{item.title}"</p>
                          </div>
                          <button onClick={() => setSelectedStudent(item)} className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl mt-4">
                            Review Bab 1 - 5 Siswa Ini →
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 font-bold mb-2">← Kembali ke Daftar Siswa</button>
                      <div className="bg-white p-4 rounded-xl border">
                        <h3 className="font-bold text-base">Siswa: {selectedStudent.student?.name}</h3>
                        <p className="text-xs text-slate-500">Judul: {selectedStudent.title}</p>
                      </div>

                      <h4 className="font-bold text-slate-900 pt-2">Evaluasi Bab 1 Sampai Bab 5</h4>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const ch = selectedStudent.chapters?.find((c: any) => c.chapter_number === num);
                          const fileUrl = ch?.file_path ? `https://backend.mejatika.com/storage/${ch.file_path}` : null;
                          const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');

                          const currentReview = chapterReviews[num] || { status: ch?.status || 'approved', teacher_feedback: ch?.teacher_feedback || '' };

                          return (
                            <div key={num} className="p-5 border rounded-xl bg-white flex flex-col gap-4 shadow-sm">
                              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-4">
                                <div className="flex-1">
                                  <h5 className="font-bold text-base text-slate-900">Bab {num}: {getChapterName(num)}</h5>
                                  <p className="text-xs text-slate-400">Versi: {ch?.current_version || 'Belum Diunggah'}</p>
                                  {fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold block mt-1">📥 Unduh File Siswa</a>}
                                  {ch?.student_note && <p className="text-xs text-slate-500 mt-1 italic">"Pesan siswa: {ch.student_note}"</p>}
                                  <span className={`inline-block mt-2 px-2.5 py-1 rounded text-xs font-bold ${getStatusBadge(ch?.status)}`}>
                                    Status Saat Ini: {ch ? translateStatus(ch.status) : 'Belum Ada Berkas'}
                                  </span>
                                </div>
                                
                                {/* FORM PENILAIAN REVISI / ACC PER BAB */}
                                <div className="bg-slate-50 p-4 rounded-xl border w-full md:w-96 text-xs">
                                  {ch ? (
                                    <form onSubmit={(e) => handleReviewKtiPerChapter(e, ch.id, num)} className="space-y-2">
                                      <p className="font-bold text-indigo-900">Form Koreksi Bab {num}</p>
                                      <div>
                                        <label className="block font-semibold mb-1">Keputusan Evaluation</label>
                                        <select 
                                          className="w-full p-2 border rounded bg-white text-xs font-medium"
                                          value={currentReview.status} 
                                          onChange={(e) => setChapterReviews({
                                            ...chapterReviews,
                                            [num]: { ...currentReview, status: e.target.value }
                                          })}
                                        >
                                          <option value="approved">✔️ ACC / Disetujui (Bab {num})</option>
                                          <option value="need_revision">❌ Minta Revisi Berkas</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block font-semibold mb-1">Catatan Koreksi Bab {num}</label>
                                        <textarea 
                                          className="w-full p-2 border rounded bg-white text-xs" 
                                          rows={3} 
                                          placeholder={`Tulis masukan untuk Bab ${num}...`} 
                                          value={currentReview.teacher_feedback} 
                                          onChange={(e) => setChapterReviews({
                                            ...chapterReviews,
                                            [num]: { ...currentReview, teacher_feedback: e.target.value }
                                          })}
                                          required
                                        ></textarea>
                                      </div>
                                      <button type="submit" disabled={reviewingId === ch.id} className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                                        {reviewingId === ch.id ? 'Memproses Ulasan...' : `Kirim Penilaian Bab ${num}`}
                                      </button>
                                    </form>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">Siswa belum mengunggah berkas untuk Bab {num}.</p>
                                  )}
                                </div>
                              </div>

                              {/* LIVE PREVIEW FILE DENGAN SCROLL INDEPENDEN */}
                              {fileUrl && (
                                <div className="mt-2 border rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                                  <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-600">🖥️ Live Preview Dokumen Bab {num}</span>
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold">↗️ Buka di Tab Baru</a>
                                  </div>
                                  <div className="w-full bg-slate-200">
                                    {isPdf ? (
                                      /* PDF PREVIEW WITH INDEPENDENT INTERNAL SCROLL */
                                      <div className="w-full h-[550px] overflow-hidden">
                                        <iframe 
                                          src={`${fileUrl}#toolbar=1`} 
                                          className="w-full h-full border-0" 
                                          title={`Preview PDF Bab ${num}`}
                                        />
                                      </div>
                                    ) : (
                                      /* DOCX PREVIEW WITH INDEPENDENT INTERNAL SCROLL */
                                      <div className="relative">
                                        {docxLoading && <div className="p-4 text-center text-xs font-bold">Memuat Preview Word...</div>}
                                        {docxError && <div className="p-4 text-center text-xs text-red-500">{docxError}</div>}
                                        <div 
                                          ref={(el) => { 
                                            docxPreviewRefs.current[num] = el; 
                                            if (el && !el.dataset.rendered) { 
                                              el.dataset.rendered = "true"; 
                                              renderDocxPreview(fileUrl, num); 
                                            } 
                                          }} 
                                          className="bg-white max-h-[550px] overflow-y-auto p-6 shadow-inner" 
                                        />
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
            /* MODUL PEDOMAN BAKU DAFTAR PUSTAKA */
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">📚 Pedoman Baku Penulisan Daftar Pustaka (APA Style 7th)</h2>
                <p className="text-xs text-slate-500 mt-1">Acuan penulisan referensi karya tulis ilmiah SMAS Seminari Pius XII Kisol.</p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h4 className="font-bold text-indigo-700 mb-1">1. Format Sumber dari Buku</h4>
                  <p className="font-mono bg-white p-2 rounded border">Nama Belakang, Inisial. (Tahun). <i>Judul Buku Miring</i>. Penerbit.</p>
                  <p className="mt-2 text-slate-500"><strong>Contoh:</strong> Sugiyono. (2019). <i>Metode Penelitian Kuantitatif, Kualitatif, dan R&D</i>. Alfabeta.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h4 className="font-bold text-indigo-700 mb-1">2. Format Sumber dari Jurnal Ilmiah / Artikel Online</h4>
                  <p className="font-mono bg-white p-2 rounded border">Nama Belakang, Inisial. (Tahun). Judul artikel. <i>Nama Jurnal Miring</i>, Vol(No), Halaman. https://doi.org/xxx</p>
                  <p className="mt-2 text-slate-500"><strong>Contoh:</strong> Pratama, A., & Wijaya, B. (2021). Analisis Implementasi AI Pada Pendidikan. <i>Jurnal Teknologi Sains</i>, 5(2), 45-58.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border">
                  <h4 className="font-bold text-indigo-700 mb-1">3. Aturan Umum Urutan Penulisan</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Urutkan daftar pustaka berdasarkan alfabet nama belakang penulis (A-Z).</li>
                    <li>Gunakan format <i>Hanging Indent</i> (baris kedua dan seterusnya masuk ke dalam 0.5 inci / 1.27 cm).</li>
                    <li>Gunakan spasi ganda atau 1.5 spasi sesuai dengan standar format KTI sekolah.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
