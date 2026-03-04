interface RecentReportsProps {
    reports?: Array<{
        id: string;
        reason: string;
        status: string;
        createdAt: string;
        video: {
            id: string;
            title: string;
        };
        reporter: {
            id: string;
            username: string;
        };
    }>;
}
export default function RecentReports({ reports }: RecentReportsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=RecentReports.d.ts.map