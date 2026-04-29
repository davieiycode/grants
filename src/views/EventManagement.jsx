import React from 'react';

const EventManagement = ({ events, currentUser }) => {
  return (
    <div className="animate-fade-in">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] mb-2 font-['Outfit']">Event Management</h1>
          <p className="text-[#64748b]">Daftar program hibah yang tersedia dan riwayat kegiatan.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events?.map((e, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:border-sky-200 hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                {e.category || 'General'}
              </span>
              <span className="text-xs font-bold text-slate-400">{e.start_date}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">
              {e.event_name}
            </h3>
            <div className="text-sm font-medium text-slate-500 line-clamp-2">
              Batas Pagu: {e.allocated_fee || 'Tidak ditentukan'}
            </div>
          </div>
        ))}
        {(!events || events.length === 0) && (
          <div className="col-span-full p-8 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">Belum ada data event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
