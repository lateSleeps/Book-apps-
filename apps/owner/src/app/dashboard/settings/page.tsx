import { redirect } from 'next/navigation';

// /dashboard/settings -> redirect to first domain
export default function SettingsPage() {
  redirect('/dashboard/settings/brand');
}
