
import React, { useState } from 'react';
import { VideoMetadata, VideoPlatform } from '../types';

interface Props {
  video: VideoMetadata;
  onNotify: (msg: string, type?: 'success' | 'info') => void;
}

const ResultCard: React.FC<Props> = ({ video, onNotify }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const isYoutube = video.platform === VideoPlatform.YOUTUBE;

  const handleDownload = async (type: 'video' | 'audio') => {
    setDownloadProgress(0);
    onNotify(`${type === 'video' ? 'Video' : 'Audio'} tayyorlanmoqda...`, 'info');

    // Simulate real download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    // Final trigger
    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      
      // Creating a real download trigger (Blob simulation for demo)
      // In a production environment with a backend, this would fetch the actual stream
      const element = document.createElement("a");
      const file = new Blob(["Simulated Video Content"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${video.title.replace(/\s+/g, '_')}_SnapMedia.${type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      onNotify("Muvaffaqiyatli yuklab olindi! Galereyangizni tekshiring.", 'success');
      
      setTimeout(() => setDownloadProgress(null), 1000);
    }, 3500);
  };

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row min-h-[400px]">
      <div className="md:w-1/2 relative group overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 flex space-x-2">
          {isYoutube ? (
            <div className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl">YouTube</div>
          ) : (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl">Instagram</div>
          )}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 mb-3 inline-block">
            {video.duration} • HD Sifat
          </span>
          <h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{video.title}</h3>
        </div>
      </div>

      <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-slate-900/40">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
              <span className="text-indigo-400 font-bold">@</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Muallif</p>
              <p className="text-white font-bold">{video.author}</p>
            </div>
          </div>
          
          {video.aiSummary && (
            <div className="relative group mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-slate-900/80 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Gemini AI Xulosasi
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                  "{video.aiSummary}"
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {downloadProgress !== null && (
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest">
                <span>Yuklanmoqda...</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => handleDownload('video')}
              disabled={downloadProgress !== null}
              className="group relative bg-white hover:bg-slate-100 text-slate-900 font-black py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-white/10 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Videoni Saqlash
            </button>
            <button 
              onClick={() => handleDownload('audio')}
              disabled={downloadProgress !== null}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center border border-white/5 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Faqat Audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
