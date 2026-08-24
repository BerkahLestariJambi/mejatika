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
  
  // State Deteksi Pendaftaran
  const [isRegistered, setIsRegistered] = useState(true);
  const [listTeachers, setListTeachers] = useState<any[]>([]);

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
  }, []);

  // Ambil token dari localStorage
  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const headers = getAuthHeader();
    try {
      // 1. Coba akses sebagai rute siswa terlebih dahulu
      let response = await fetch(`${API_URL}/student/kti/dashboard`, {
        method: 'GET',
        headers: headers
      });

      // 2. Jika gagal/bukan siswa, coba akses rute mentor
      if (!response.ok) {
        response = await fetch(`${API_URL}/mentor/kti/dashboard`, {
          method: 'GET',
          headers: headers
        });
      }

      const resData = await response.json();
      
      if (response.ok) {
        const roleDetected = resData.role_detected?.toLowerCase();
        setRole(roleDetected);
        setDataKti(resData.data);
        setIsRegistered(true);
      } else {
        // Cek jika pesan error menyatakan belum terdaftar program bimbingan
        if (resData.message && resData.message.includes("belum terdaftar")) {
          setIsRegistered(false);
          setRole("siswakti"); // Default fallback role untuk pengisian form
          fetchTeachersList();
        } else {
          alert(resData.message || "Gagal memuat data dashboard KTI.");
        }
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

const fetchTeachersList = async () => {
    try {
      // Ambil seluruh data user dari master endpoint
      const response = await fetch(`${API_URL}/users`, { 
        method: 'GET',
        headers: getAuthHeader()
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        // Ekstrak array dari struktur response (mengantisipasi jika dibungkus objek .data)
        const allUsers = resData.data || resData.users || (Array.isArray(resData) ? resData : []);
        
        if (Array.isArray(allUsers)) {
          // FILTER DI FRONTEND: Ambil hanya user yang rolenya 'pembimbing' atau 'mentor'
          const filteredTeachers = allUsers.filter((user: any) => {
            const userRole = String(user.role || '').toLowerCase();
            return userRole === 'pembimbing' || userRole === 'mentor';
          });
          
          console.log("Berhasil memfilter pembimbing dari DB:", filteredTeachers);
          setListTeachers(filteredTeachers);
        }
      } else {
        console.error("Gagal memuat data user:", resData.message);
      }
    } catch (error) {
      console.error("Terjadi kesalahan jaringan:", error);
      
      // Fallback lokal jika API mendadak putus koneksi
      setListTeachers([
        { id: 2, name: "Roni Haryanto (Mentor)" },
        { id: 4, name: "Hironimus Haryanto (Pembimbing)" }
      ]);
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
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(registerData)
      });

      const resData = await response.json();

      if (response.ok) {
        alert("Pendaftaran Judul KTI Berhasil!");
        setIsRegistered(true);
        fetchDashboardData(); // Reload data untuk memicu tampilan bimbingan bab
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
    if (reviewData.feedback_file) {
      formData.append('feedback_file', reviewData.feedback_file);
    }

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 animate-pulse font-medium">Memuat Fitur Bimbingan KTI...</p>
      </div>
    );
  }

  // Cek kategori role grup untuk mempermudah rendering interface
  const isStudentRole = role === 'siswa' || role === 'siswakti' || role === 'pelajar' || role === 'peserta';
  const isMentorRole = role === 'mentor' || role === 'pembimbing' || role === 'kontributor';

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen text-gray-800">
      <header className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pusat Bimbingan KTI Per Bab</h1>
        <p className="text-sm text-gray-500">Akses Eksklusif Kelas Karya Tulis Ilmiah Mejatika</p>
      </header>

      {/* ======================================================= */}
      {/* ⚠️ KONDISI BELUM TERDAFTAR: TAMPILKAN FORMULIR REGISTRASI */}
      {/* ======================================================= */}
      {!isRegistered && isStudentRole && (
        <div className="max-w-xl mx-auto border border-amber-200 bg-amber-50/20 p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight italic">Pendaftaran Judul KTI Baru</h2>
          <p className="text-xs text-gray-500 mb-6">Anda belum terdaftar dalam sistem bimbingan. Silakan isi form di bawah ini untuk memulai.</p>
          
          <form onSubmit={handleRegisterKti} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Judul Lengkap KTI</label>
              <input 
                type="text"
                required
                className="w-full text-sm p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Contoh: Pengaruh Media Digital Terhadap Minat Baca..."
                value={registerData.title}
                onChange={(e) => setRegisterData({...registerData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Abstrak / Deskripsi Singkat Ide</label>
              <textarea 
                rows={3}
                className="w-full text-sm p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Gambarkan secara ringkas ide penelitian karya tulis ilmiah Anda..."
                value={registerData.abstract}
                onChange={(e) => setRegisterData({...registerData, abstract: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Pilih Guru Pembimbing</label>
              <select 
  required
  className="w-full text-sm p-3 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
  value={registerData.teacher_id}
  onChange={(e) => setRegisterData({...registerData, teacher_id: e.target.value})}
>
  <option value="">-- Pilih Pembimbing --</option>
  {listTeachers.map((teacher: any) => (
    <option key={teacher.id} value={teacher.id}>
      {teacher.name} ({teacher.role})
    </option>
  ))}
</select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Tahun Akademik</label>
                <input 
                  type="text" 
                  disabled
                  className="w-full text-sm p-3 border rounded-xl bg-gray-100 text-gray-500 font-medium"
                  value={registerData.academic_year}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={registering}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition mt-2 disabled:bg-gray-400"
            >
              {registering ? 'Memproses Pendaftaran...' : 'Kirim Pengajuan Judul KTI'}
            </button>
          </form>
        </div>
      )}

      {/* ======================================================= */}
      {/* ✍️ INTERFACE JIKA SUDAH TERDAFTAR: SISWA / SISWAKTI */}
      {/* ======================================================= */}
      {isRegistered && isStudentRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">{dataKti?.title}</h2>
              <p className="text-xs text-gray-500 mb-2">Tahun Akademik: {dataKti?.academic_year} | Pembimbing: {dataKti?.teacher?.name}</p>
              <div className="p-3 bg-white rounded border text-xs text-gray-600 italic">
                "{dataKti?.abstract || 'Belum ada abstrak.'}"
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mt-4">Status Review 5 Bab KTI</h3>
            {[1, 2, 3, 4, 5].map((num) => {
              const ch = dataKti?.chapters?.find((c: any) => c.chapter_number === num);
              return (
                <div key={num} className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm">
                  <div>
                    <h4 className="font-medium text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h4>
                    <p className="text-xs text-gray-400">Versi saat ini: {ch?.current_version || 'Belum ada'}</p>
                    
                    {ch?.file_path && (
                      <a 
                        href={`https://backend.mejatika.com/storage/${ch.file_path}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-indigo-600 hover:underline block mt-1"
                      >
                        📄 Lihat Dokumen Yang Diupload
                      </a>
                    )}

                    {ch?.teacher_feedback && (
                      <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2 rounded border border-amber-200">
                        <strong>Catatan Mentor:</strong> {ch.teacher_feedback}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ch?.status)}`}>
                      {ch ? translateStatus(ch.status) : 'Belum Diupload'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border h-fit">
            <h3 className="font-semibold text-slate-900 mb-4">Unggah Dokumen KTI</h3>
            <form onSubmit={handleUploadKti} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Bab KTI</label>
                <select 
                  className="w-full text-sm p-2 border rounded bg-white"
                  value={uploadData.chapter_number}
                  onChange={(e) => setUploadData({...uploadData, chapter_number: e.target.value})}
                >
                  <option value="1">Bab 1: Pendahuluan</option>
                  <option value="2">Bab 2: Tinjauan Pustaka</option>
                  <option value="3">Bab 3: Metode Penelitian</option>
                  <option value="4">Bab 4: Pembahasan & Analisis</option>
                  <option value="5">Bab 5: Kesimpulan & Saran</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">File Dokumen (PDF/Docx, Max 10MB)</label>
                <input 
                  type="file" 
                  accept=".pdf,.docx"
                  className="w-full text-xs bg-white border p-2 rounded"
                  onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Tambahan untuk Guru</label>
                <textarea 
                  rows={3}
                  className="w-full text-sm p-2 border rounded bg-white"
                  placeholder="Contoh: Sudah memperbaiki latar belakang masalah.."
                  value={uploadData.student_note}
                  onChange={(e) => setUploadData({...uploadData, student_note: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded transition disabled:bg-gray-400"
              >
                {uploading ? 'Mengirim berkas...' : 'Kirim Pengajuan Bab'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 👨‍🏫 INTERFACE JIKA GURU: MENTOR / PEMBIMBING */}
      {/* ========================================== */}
      {isRegistered && isMentorRole && (
        <div className="space-y-6">
          {!selectedStudent ? (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Daftar Siswa Bimbingan KTI Anda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataKti?.map((item: any) => (
                  <div key={item.id} className="p-4 border rounded-xl bg-white shadow-sm hover:border-indigo-300 transition duration-150 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Siswa</span>
                      <h4 className="font-bold text-base text-slate-800 mt-2">{item.student?.name}</h4>
                      <p className="text-xs text-gray-500 mb-3">Judul: {item.title}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(item)}
                      className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2 rounded"
                    >
                      Buka Lembar Bimbingan →
                    </button>
                  </div>
                ))}
                {dataKti?.length === 0 && <p className="text-sm text-gray-400 italic">Belum ada siswa yang mendaftar bimbingan.</p>}
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
                ← Kembali ke Daftar Siswa
              </button>

              <div className="bg-slate-50 p-4 rounded-xl border mb-6">
                <h3 className="font-bold text-lg text-slate-900">Siswa: {selectedStudent.student?.name}</h3>
                <p className="text-sm font-medium text-gray-700">Judul KTI: {selectedStudent.title}</p>
              </div>

              <h4 className="font-semibold text-slate-900 mb-3">Daftar Bab & Aksi Penilaian</h4>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((num) => {
                  const ch = selectedStudent.chapters?.find((c: any) => c.chapter_number === num);
                  return (
                    <div key={num} className="p-4 border rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                      <div>
                        <h5 className="font-semibold text-sm text-slate-900">Bab {num}: {getChapterName(num)}</h5>
                        <p className="text-xs text-gray-500">Versi: {ch?.current_version || 'Belum Diupload'}</p>
                        
                        {ch?.file_path && (
                          <a 
                            href={`https://backend.mejatika.com/storage/${ch.file_path}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-indigo-600 font-medium hover:underline block mt-1"
                          >
                            📥 Unduh Dokumen Siswa
                          </a>
                        )}

                        {ch?.student_note && <p className="text-xs text-gray-600 mt-1 italic">"Pesan siswa: {ch.student_note}"</p>}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(ch?.status)}`}>
                          {ch ? translateStatus(ch.status) : 'Kosong'}
                        </span>
                        
                        {ch && ch.status === 'pending' && (
                          <div className="bg-slate-50 p-4 rounded-lg border w-full md:w-80 text-xs">
                            <form onSubmit={(e) => handleReviewKti(e, ch.id)} className="space-y-2">
                              <div>
                                <label className="block font-medium mb-1">Keputusan</label>
                                <select 
                                  className="w-full p-1 border rounded bg-white text-xs"
                                  value={reviewData.status}
                                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                                >
                                  <option value="approved">ACC (Setujui Bab)</option>
                                  <option value="need_revision">Minta Revisi</option>
                                </select>
                              </div>
                              <div>
                                <label className="block font-medium mb-1">Catatan Penilaian</label>
                                <textarea 
                                  className="w-full p-1 border rounded bg-white text-xs" 
                                  rows={2}
                                  placeholder="Tulis ulasan Anda..."
                                  value={reviewData.teacher_feedback}
                                  onChange={(e) => setReviewData({...reviewData, teacher_feedback: e.target.value})}
                                  required
                                ></textarea>
                              </div>
                              <button 
                                type="submit" 
                                disabled={reviewing}
                                className="w-full bg-indigo-600 text-white p-1.5 rounded font-medium hover:bg-indigo-700 transition"
                              >
                                {reviewing ? 'Memproses...' : 'Kirim Ulasan'}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
