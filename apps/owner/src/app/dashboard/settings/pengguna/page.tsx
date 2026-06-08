import {
  SettingsPageShell,
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';

export default function PenggunaPage() {
  return (
    <SettingsPageShell>
      <SettingsSection>
        <SettingsSectionHeader
          title="Pengguna & Akses"
          description="Kelola akun pengguna dashboard dan izin akses per peran."
        />
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">Domain belum diimplementasi — Phase 5.8.</p>
        </SettingsContentCard>
      </SettingsSection>
    </SettingsPageShell>
  );
}
