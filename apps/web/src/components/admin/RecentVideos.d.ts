interface RecentVideosProps {
    videos?: Array<{
        id: string;
        title: string;
        status: string;
        createdAt: string;
        uploader: {
            id: string;
            username: string;
        };
    }>;
}
export default function RecentVideos({ videos }: RecentVideosProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=RecentVideos.d.ts.map