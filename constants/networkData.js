// constants/networkData.js
import { Globe, HardDrive, Terminal, Shield, HelpCircle, Cpu } from 'lucide-react';

export const NETWORK_CONTENT = {
  intro: {
    id: 'intro',
    title: "The Silent Crisis: Satu Jam Tanpa Internet",
    iconName: 'Globe',
    accentColor: 'rose',
    description: "Analisis dampak global jika konektivitas hilang secara mendadak.",
    details: {
      caseTitle: "Global Blackout",
      impacts: [
        { label: "Finansial", value: "Transaksi senilai $2.1 Miliar terhenti seketika." },
        { label: "Logistik", value: "Rantai pasok dunia macet karena hilangnya data navigasi digital." },
        { label: "Sosial", value: "Isolasi informasi memicu kepanikan massal di pusat kota." }
      ]
    }
  },
  hardware: {
    id: 'hardware',
    title: "Anatomi Perangkat Keras Jaringan",
    iconName: 'Cpu',
    accentColor: 'blue',
    devices: [
      {
        name: "Switch (Layer 2)",
        desc: "Menghubungkan perangkat dalam satu local network (LAN) menggunakan MAC Address.",
      },
      {
        name: "Router (Layer 3)",
        desc: "Menghubungkan antar network berbeda dan menentukan rute paket data tercepat.",
      }
    ]
  },
  demo_ip: {
    id: 'demo_ip',
    title: "Live Terminal: Cek Identitas Digital",
    iconName: 'Terminal',
    accentColor: 'emerald',
    terminalData: {
      user: "Visitor",
      ipv4: "192.168.100.24",
      gateway: "192.168.100.1",
      adapter: "Intel(R) Wi-Fi 6 AX201"
    }
  },
  security: {
    id: 'security',
    title: "Keamanan & Protokol",
    iconName: 'Shield',
    accentColor: 'amber',
    protocols: [
      { name: "HTTP", port: 80, secure: false, desc: "Data dikirim teks biasa (raw)." },
      { name: "HTTPS", port: 443, secure: true, desc: "Data dibungkus enkripsi SSL/TLS." }
    ]
  },
  qa: {
    id: 'qa',
    title: "Sesi Interaktif & FAQ",
    iconName: 'HelpCircle',
    accentColor: 'indigo',
    faqs: [
      { q: "Apa itu IP Public?", a: "Alamat unik rumah Anda di internet yang diberikan oleh ISP." },
      { q: "Kenapa internet lambat saat hujan?", a: "Sinyal radio (Wi-Fi/4G) terganggu oleh partikel air di udara (Rain Fade)." }
    ]
  }
};
