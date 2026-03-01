export function getTranscodingQueue() {
  return {
    startWorker: () => {
      console.log('⚠️  Transcoding worker disabled in development')
    },
    stopWorker: async () => {},
    addJob: async (data: any) => {
      console.log('Transcoding job queued:', data)
    },
    getJobStatus: async (jobId: string) => ({
      id: jobId,
      status: 'unknown',
      progress: 0,
    }),
  }
}
