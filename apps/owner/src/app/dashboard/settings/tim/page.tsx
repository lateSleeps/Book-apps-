import {
  SettingsPageShell,
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';

export default function TimPage() {
  return (
    <SettingsPageShell>
      <SettingsSection>
        <SettingsSectionHeader
          title="Tim"
          description="Kelola stylist, availability, dan jadwal kerja anggota tim."
        />
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">Domain belum diimplementasi — Phase 5.4.</p>
        </SettingsContentCard>
      </SettingsSection>
    </SettingsPageShell>
  );
}
