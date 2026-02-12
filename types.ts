
export enum VideoPlatform {
  YOUTUBE = 'YOUTUBE',
  INSTAGRAM = 'INSTAGRAM',
  UNKNOWN = 'UNKNOWN'
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  platform: VideoPlatform;
  thumbnail: string;
  duration: string;
  author: string;
  aiSummary?: string;
}

export type MessageType = 'user' | 'bot' | 'system' | 'file' | 'status';

export interface ChatMessage {
  id: string;
  type: MessageType;
  text?: string;
  videoData?: VideoMetadata;
  fileUrl?: string;
  timestamp: number;
  isLoading?: boolean;
  status?: 'analyzing' | 'downloading' | 'converting' | 'completed';
}

export interface DownloadHistoryItem {
  video: VideoMetadata;
  timestamp: number;
}
