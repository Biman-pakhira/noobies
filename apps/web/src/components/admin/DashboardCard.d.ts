import { ReactNode } from 'react';
interface DashboardCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color: 'blue' | 'green' | 'red' | 'purple';
    change?: string;
}
export default function DashboardCard({ title, value, icon, color, change, }: DashboardCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=DashboardCard.d.ts.map