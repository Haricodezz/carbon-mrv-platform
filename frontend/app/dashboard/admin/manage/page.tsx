import { redirect } from 'next/navigation';

export default function AdminManagePage() {
  redirect('/dashboard/admin/projects');
}
