
import React from 'react';
import { DownloadHistoryItem, VideoMetadata, VideoPlatform } from '../types';

interface Props {
  items: DownloadHistoryItem[];
  onSelect: (video: VideoMetadata) => void;
}

const HistoryList: React.FC<Props> = ({ items, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, idx) => {
        const isYoutube = item.video.platform === VideoPlatform.YOUTUBE;
        return (
          <div 
            key={`${item.video.id}-${idx}`}
            onClick={() => onSelect(item.video)}
            className="glass-panel p-3 rounded-2xl flex items-center space-x-4 cursor-pointer hover:bg-slate-800/80 transition-all hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={item.video.thumbnail} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{item.video.title}</p>
              <div className="flex items-center space-x-2 mt-1">
                {isYoutube ? (
                  <span className="text-red-500 text-[10px] font-bold uppercase">YouTube</span>
                ) : (
                  <span className="text-pink-500 text-[10px] font-bold uppercase">Instagram</span>
                )}
                <span className="text-slate-500 text-[10px]">•</span>
                <span className="text-slate-500 text-[10px]">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryList;
