import type { Metadata } from 'next';
import { AdminGuard } from '@/components/admin/admin-guard';

export const metadata: Metadata = {
	title: 'Admin Panel - PolystirolHub',
	description: 'Administration panel',
};

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AdminGuard>{children}</AdminGuard>;
}
