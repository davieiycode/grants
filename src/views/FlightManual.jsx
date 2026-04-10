import React from 'react';
import { BookOpen, Search, HelpCircle, ChevronRight } from 'lucide-react';

const FlightManual = () => {
  const categories = [
    { title: 'Submisi Usulan', count: 12, icon: 'FileText' },
    { title: 'Proses Penilaian', count: 8, icon: 'Award' },
    { title: 'Administrasi Akun', count: 5, icon: 'Settings' },
    { title: 'Ketentuan Umum', count: 14, icon: 'ShieldInfo' },
  ];

  const faqs = [
    { 
      q: 'Bagaimana cara mengganti unit asal?', 
      a: 'Anda dapat memperbarui unit kerja melalui menu Profil di pojok kanan atas, lalu pilih Pengaturan Akun.' 
    },
    { 
      q: 'Kenapa usulan saya tidak bisa di-submit?', 
      a: 'Pastikan seluruh atribut wajib (*) telah diisi dan berkas yang diunggah sesuai dengan format (PDF/IMG).' 
    },
    { 
      q: 'Apa itu Mission Captain?', 
      a: 'Mission Captain adalah Corresponding Author yang akan menjadi narahubung utama untuk usulan penelitian tersebut.' 
    }
  ];

  return (
    <div className="animate-fade-in">
       <header className="mb-12 max-w-4xl">
        <h1 className="text-5xl font-black font-['Outfit'] mb-4 tracking-tight text-[#0f172a]">Flight Manual (Q&A)</h1>
        <p className="text-[#64748b] text-lg font-medium">Buku panduan orbital untuk navigasi sistem hibah dan protokol penelitian ProSpace.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              placeholder="Cari solusi teknis atau panduan..." 
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-sky-50 shadow-sm transition-all text-lg font-medium" 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Pertanyaan Populer</h3>
            <div className="grid gap-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-[#0ea5e9] transition-all group cursor-pointer shadow-sm shadow-slate-50">
                   <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                          <HelpCircle size={18} />
                        </div>
                        <div className="font-bold text-[#0f172a] text-lg font-['Outfit']">{faq.q}</div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-[#0ea5e9] transition-colors" />
                   </div>
                   <p className="mt-4 text-slate-500 leading-relaxed font-medium pl-12">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] shadow-2xl shadow-sky-900/20 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-bold font-['Outfit'] mb-2">Butuh Bantuan Langsung?</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Hubungi Mission Control untuk bantuan teknis darurat.</p>
                <button className="w-full bg-white text-[#0f172a] py-4 rounded-2xl font-black text-sm hover:bg-sky-50 transition-colors">
                  KIRIM SINYAL (TIKET)
                </button>
             </div>
             <BookOpen className="absolute -bottom-8 -right-8 text-white opacity-5" size={160} />
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem]">
             <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider mb-6">Kategori Panduan</h3>
             <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <button key={idx} className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group">
                    <span className="font-bold text-slate-600 group-hover:text-[#0ea5e9] transition-colors">{cat.title}</span>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">{cat.count}</span>
                  </button>
                ))}
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FlightManual;
