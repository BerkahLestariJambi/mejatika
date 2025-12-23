-- MEJATIKA Seed Data
-- Initial data for testing and development

-- Insert default admin user
INSERT INTO users (name, email, password, role, avatar, status) VALUES
('Admin MEJATIKA', 'admin@mejatika.com', 'admin123', 'admin', '/placeholder-user.jpg', 'active'),
('Contributor One', 'contributor@mejatika.com', 'contributor123', 'contributor', '/placeholder-user.jpg', 'active'),
('Peserta Kursus', 'peserta@mejatika.com', 'peserta123', 'participant', '/placeholder-user.jpg', 'active');

-- Insert settings
INSERT INTO settings (key, value, type, group_name, description) VALUES
('site_name', 'MEJATIKA', 'string', 'general', 'Nama website'),
('site_description', 'Platform Pembelajaran Digital Terpadu', 'string', 'general', 'Deskripsi website'),
('site_logo', '/placeholder-logo.png', 'string', 'general', 'Logo website'),
('contact_email', 'info@mejatika.com', 'string', 'contact', 'Email kontak'),
('contact_phone', '+62 812-3456-7890', 'string', 'contact', 'Nomor telepon'),
('contact_address', 'Jl. Pendidikan No. 123, Jakarta', 'string', 'contact', 'Alamat kantor'),
('enable_registration', 'true', 'boolean', 'features', 'Aktifkan pendaftaran'),
('google_ads_code', '', 'text', 'ads', 'Kode Google Ads');

-- Insert main menus
INSERT INTO menus (title, slug, url, icon, order_number, is_active) VALUES
('Beranda', 'beranda', '/', 'Home', 1, true),
('Berita', 'berita', '/berita', 'Newspaper', 2, true),
('Kursus', 'kursus', '/kursus', 'BookOpen', 3, true),
('Galeri', 'galeri', '/galeri', 'Image', 4, true),
('Download', 'download', '/download', 'Download', 5, true),
('Tentang', 'tentang', '/tentang', 'Info', 6, true);

-- Insert categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
('Teknologi', 'teknologi', 'Berita seputar teknologi dan inovasi', '#3B82F6', 'Laptop'),
('Pendidikan', 'pendidikan', 'Informasi dunia pendidikan', '#10B981', 'GraduationCap'),
('Pengumuman', 'pengumuman', 'Pengumuman resmi', '#F59E0B', 'Bell'),
('Event', 'event', 'Kegiatan dan acara', '#8B5CF6', 'Calendar'),
('Tutorial', 'tutorial', 'Tutorial dan panduan', '#EC4899', 'BookOpen');

-- Insert sliders
INSERT INTO sliders (title, description, image_url, link, button_text, order_number, is_active) VALUES
('Selamat Datang di MEJATIKA', 'Platform pembelajaran digital terbaik untuk meningkatkan keterampilan Anda', '/placeholder.jpg', '/kursus', 'Mulai Belajar', 1, true),
('Kursus Online Berkualitas', 'Belajar dari instruktur berpengalaman dengan materi terstruktur', '/placeholder.jpg', '/kursus', 'Lihat Kursus', 2, true),
('Sertifikat Profesional', 'Dapatkan sertifikat yang diakui setelah menyelesaikan kursus', '/placeholder.jpg', '/kursus', 'Daftar Sekarang', 3, true);

-- Insert announcements
INSERT INTO announcements (content, link, type, is_active, order_number) VALUES
('Pendaftaran kursus batch baru telah dibuka! Daftar sekarang juga.', '/kursus', 'info', true, 1),
('Webinar gratis: Pengenalan Programming untuk Pemula - 25 Januari 2025', '/berita/webinar-programming', 'success', true, 2),
('Sistem maintenance dijadwalkan pada 20 Januari 2025 pukul 02:00 - 04:00 WIB', null, 'warning', true, 3);

-- Insert sample news
INSERT INTO news (title, slug, content, excerpt, featured_image, category_id, author_id, status, is_featured, published_at, views) VALUES
('Peluncuran Platform MEJATIKA Versi 2.0', 'peluncuran-mejatika-v2', 
'<p>Kami dengan bangga mengumumkan peluncuran MEJATIKA versi 2.0 yang hadir dengan berbagai fitur baru dan peningkatan performa.</p><p>Fitur-fitur baru meliputi sistem pembelajaran interaktif, dashboard yang lebih intuitif, dan integrasi dengan berbagai platform pembelajaran online.</p>', 
'Platform pembelajaran MEJATIKA hadir dengan versi terbaru yang lebih powerful dan user-friendly.', 
'/placeholder.jpg', 3, 1, 'published', true, CURRENT_TIMESTAMP, 150),

('10 Tips Belajar Programming untuk Pemula', 'tips-belajar-programming', 
'<p>Belajar programming memang memerlukan dedikasi dan strategi yang tepat. Berikut adalah 10 tips yang bisa membantu pemula dalam memulai journey programming.</p><p>1. Mulai dengan bahasa yang mudah dipelajari<br>2. Praktik setiap hari<br>3. Buat project sendiri<br>4. Ikuti tutorial online<br>5. Bergabung dengan komunitas developer</p>', 
'Panduan lengkap untuk pemula yang ingin memulai belajar programming dengan metode yang efektif.', 
'/placeholder.jpg', 5, 2, 'published', true, CURRENT_TIMESTAMP, 230),

('Webinar: Artificial Intelligence dalam Pendidikan', 'webinar-ai-pendidikan', 
'<p>MEJATIKA mengadakan webinar gratis tentang pemanfaatan AI dalam dunia pendidikan. Webinar ini akan membahas tren terkini dan implementasi praktis AI di sektor edukasi.</p><p>Narasumber: Dr. Ahmad Fauzi, Pakar AI dalam Pendidikan.<br>Waktu: 25 Januari 2025, 14:00 WIB<br>Platform: Zoom Meeting</p>', 
'Ikuti webinar gratis tentang AI dalam pendidikan bersama pakar terkemuka.', 
'/placeholder.jpg', 4, 1, 'published', true, CURRENT_TIMESTAMP, 89),

('Pendaftaran Kursus Web Development Batch 5', 'pendaftaran-web-dev-batch-5', 
'<p>Kursus Web Development batch 5 telah dibuka! Program ini dirancang untuk mengajarkan siswa membuat website modern menggunakan teknologi terkini.</p><p>Materi yang akan dipelajari:<br>- HTML, CSS, JavaScript<br>- React.js dan Next.js<br>- Backend dengan Node.js<br>- Database dan API</p>', 
'Daftar sekarang untuk kursus Web Development batch 5 dengan instruktur berpengalaman.', 
'/placeholder.jpg', 3, 1, 'published', false, CURRENT_TIMESTAMP, 120),

('Success Story: Alumni MEJATIKA Bekerja di Perusahaan Tech', 'success-story-alumni', 
'<p>Inspirasi dari alumni MEJATIKA yang berhasil berkarir di perusahaan teknologi ternama setelah menyelesaikan kursus di platform kami.</p><p>Budi Santoso, lulusan kursus Full Stack Developer, kini bekerja sebagai Software Engineer di salah satu unicorn startup Indonesia.</p>', 
'Kisah sukses alumni MEJATIKA yang berhasil membangun karir di industri teknologi.', 
'/placeholder.jpg', 2, 2, 'published', false, CURRENT_TIMESTAMP, 95);

-- Insert sample courses
INSERT INTO courses (title, slug, description, thumbnail, duration, level, price, instructor_id, max_participants, status, is_featured) VALUES
('Full Stack Web Development', 'full-stack-web-development', 
'Belajar membuat website modern dari frontend hingga backend. Kursus lengkap untuk menjadi Full Stack Developer profesional.', 
'/placeholder.jpg', 120, 'intermediate', 2500000, 1, 30, 'published', true),

('Mobile App Development dengan React Native', 'mobile-app-react-native', 
'Kuasai pengembangan aplikasi mobile cross-platform menggunakan React Native untuk iOS dan Android.', 
'/placeholder.jpg', 100, 'intermediate', 2000000, 1, 25, 'published', true),

('UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 
'Pelajari prinsip-prinsip desain UI/UX yang baik untuk membuat aplikasi yang user-friendly dan menarik.', 
'/placeholder.jpg', 80, 'beginner', 1500000, 2, 40, 'published', false),

('Python untuk Data Science', 'python-data-science', 
'Mulai karir di bidang Data Science dengan mempelajari Python, pandas, dan machine learning basics.', 
'/placeholder.jpg', 90, 'beginner', 1800000, 1, 35, 'published', false);

-- Insert course schedules
INSERT INTO schedules (course_id, title, description, start_date, end_date, location, instructor_id, max_participants, status) VALUES
(1, 'Full Stack Web Development - Batch 5', 'Kelas intensif Full Stack Development', '2025-02-01 09:00:00', '2025-04-30 17:00:00', 'Online via Zoom', 1, 30, 'scheduled'),
(2, 'Mobile App Development - Batch 3', 'Kelas React Native untuk pemula dan intermediate', '2025-02-15 09:00:00', '2025-04-15 17:00:00', 'Online via Zoom', 1, 25, 'scheduled'),
(3, 'UI/UX Design - Batch 7', 'Workshop desain UI/UX komprehensif', '2025-03-01 13:00:00', '2025-04-20 17:00:00', 'Hybrid (Online & Offline)', 2, 40, 'scheduled');

-- Insert gallery items
INSERT INTO gallery (title, description, image_url, category, uploaded_by, is_featured) VALUES
('Graduation Ceremony 2024', 'Upacara wisuda angkatan 2024 di Auditorium MEJATIKA', '/placeholder.jpg', 'Event', 1, true),
('Workshop UI/UX Design', 'Dokumentasi workshop desain UI/UX dengan praktisi industri', '/placeholder.jpg', 'Workshop', 1, true),
('Kelas Programming Bootcamp', 'Suasana kelas programming bootcamp batch 4', '/placeholder.jpg', 'Kelas', 1, false),
('Hackathon MEJATIKA 2024', 'Kompetisi hackathon tahunan MEJATIKA', '/placeholder.jpg', 'Kompetisi', 1, false);

-- Insert download materials
INSERT INTO downloads (title, description, file_url, file_type, file_size, category, uploaded_by, is_active) VALUES
('Modul Belajar JavaScript', 'Panduan lengkap belajar JavaScript untuk pemula', '/files/modul-javascript.pdf', 'PDF', 2048000, 'Modul', 1, true),
('Template Project React', 'Template starter project untuk aplikasi React', '/files/react-template.zip', 'ZIP', 5120000, 'Template', 1, true),
('Cheatsheet HTML & CSS', 'Referensi cepat untuk tag HTML dan properti CSS', '/files/html-css-cheatsheet.pdf', 'PDF', 1024000, 'Cheatsheet', 1, true),
('Slides Webinar AI', 'Materi presentasi webinar AI dalam pendidikan', '/files/slides-ai-webinar.pdf', 'PDF', 3072000, 'Slides', 1, true);
