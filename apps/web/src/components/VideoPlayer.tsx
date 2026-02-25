'use client';

import { useEffect, useRef, useState } from 'react';
import HLS from 'hls.js';
import clsx from 'clsx';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ url, poster, title, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Check if HLS.js is needed (M3U8 playlist)
    if (url.includes('.m3u8')) {
      if (HLS.isSupported()) {
        const hls = new HLS();
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(HLS.Events.MANIFEST_PARSED, () => {
          // Video is ready to play
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
      }
      return;
    } else {
      video.src = url;
      return;
    }
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative w-full bg-black rounded-lg overflow-hidden group',
        className
      )}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-600 rounded-full h-1 cursor-pointer hover:h-2 group/progress transition-all">
            <div
              className="bg-red-500 h-full rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.75 1.5A.75.75 0 015 2.25v15.5a.75.75 0 001.225.57l11.15-7.75a.75.75 0 000-1.14L6.225 1.13A.75.75 0 015.75 1.5z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button className="text-white hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.172a1 1 0 011.414 0A6.972 6.972 0 0118 10c0 1.9-.716 3.638-1.894 4.95a1 1 0 01-1.415-1.414A4.972 4.972 0 0016 10c0-1.358-.27-2.646-.843-3.879a1 1 0 010-1.415zm-2.828 2.828a1 1 0 011.415 0A4.972 4.972 0 0114 10a4.972 4.972 0 01-1.414 3.536a1 1 0 01-1.414-1.414A2.972 2.972 0 0012 10c0-.844-.335-1.61-.914-2.172a1 1 0 010-1.414z" />
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (videoRef.current) {
                    videoRef.current.volume = parseFloat(e.target.value);
                  }
                }}
                className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v2H3V4zm12 0a1 1 0 011-1h5a1 1 0 011 1v2h-6V4zM3 14h6v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zm12 0h6v2a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6v4a1 1 0 01-2 0V4zm12 0a1 1 0 011 1v4a1 1 0 01-2 0V5h-3a1 1 0 010-2h4zM3 14a1 1 0 011 1v2h3a1 1 0 110 2H4a1 1 0 01-1-1v-4zm12 0a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h3v-2a1 1 0 011-1z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
