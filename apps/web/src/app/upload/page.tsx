'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadVideo, useUploadStatus } from '@/hooks/useVideos';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadVideo();
  const statusQuery = useUploadStatus(jobId || '');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const videoFile = Array.from(droppedFiles).find((f) =>
        f.type.startsWith('video/')
      );
      if (videoFile) {
        setFile(videoFile);
      } else {
        toast.error('Please select a video file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast.error('Please select a video file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    uploadMutation.mutate(formData, {
      onSuccess: (data) => {
        setJobId(data.job.id);
        setFile(null);
        setTitle('');
        setDescription('');
        toast.success('Video uploaded! Processing started...');
      },
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (jobId && statusQuery.data) {
    const { job, video } = statusQuery.data;
    const isComplete = video.status === 'READY';

    return (
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Upload Status</h1>

          <div className="bg-gray-900 rounded-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
              <p className="text-gray-400">{video.id}</p>
            </div>

            {/* Status Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">
                  {isComplete ? '✅ Complete' : '⏳ Processing'}
                </span>
                <span className="text-sm text-gray-400">{job.progress || 0}%</span>
              </div>

              {!isComplete && (
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${job.progress || 0}%` }}
                  />
                </div>
              )}
            </div>

            {/* Status Details */}
            <div className="bg-gray-800 rounded-lg p-4 mb-8">
              <h3 className="font-semibold mb-3">Processing Details</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Status:</span> {video.status}
                </p>
                <p>
                  <span className="text-gray-300">Job Status:</span> {job.status}
                </p>
                {video.duration && (
                  <p>
                    <span className="text-gray-300">Duration:</span> {Math.round(video.duration)}s
                  </p>
                )}
              </div>
            </div>

            {isComplete ? (
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/watch/${video.id}`)}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  Watch Video
                </button>
                <button
                  onClick={() => {
                    setJobId(null);
                    setFile(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Upload Another
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-400">
                This may take a few minutes depending on video size...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-8">
          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3">Video File</label>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                isDragging
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {file ? (
                <div>
                  <svg
                    className="w-12 h-12 text-green-500 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="font-semibold text-green-500">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <svg
                    className="w-12 h-12 text-gray-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="font-semibold mb-2">Drag and drop your video here</p>
                  <p className="text-sm text-gray-400 mb-4">Or click to browse</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="inline-block px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold cursor-pointer transition"
                  >
                    Select File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              maxLength={100}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-white placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description (optional)"
              maxLength={5000}
              rows={5}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none text-white placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/5000</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploadMutation.isLoading || !file || !title.trim()}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload Video'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Max file size: 10GB. Supported formats: MP4, AVI, MOV, MKV
          </p>
        </form>
      </div>
    </div>
  );
}
