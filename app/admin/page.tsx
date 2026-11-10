import type { Metadata } from 'next';
import AdminApp from './AdminApp';
import './admin.css';

export const metadata: Metadata = {
  title: '글쓰기 | Ref 관리자',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
