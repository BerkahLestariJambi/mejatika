// lib/api.ts
import { News, Course } from '@/types/database'; // Import Interface yang Anda kirim tadi

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fungsi ini sekarang "Tahu" bahwa dia akan mengembalikan array dari News
export async function getNews(): Promise<News[]> {
    const res = await fetch(`${API_URL}/news`);
    
    if (!res.ok) throw new Error('Gagal ambil berita');
    
    return res.json();
}

// Fungsi ini "Tahu" bahwa dia mengembalikan array dari Course
export async function getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_URL}/courses`);
    return res.json();
}
