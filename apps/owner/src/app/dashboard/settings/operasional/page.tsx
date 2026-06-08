import {
  SettingsPageShell,
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';

export default function OperasionalPage() {
  return (
    <SettingsPageShell>
      <SettingsSection>
        <SettingsSectionHeader
          title="Operasional"
          description="Jam buka, hari operasional, dan konfigurasi slot booking."
        />
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">Domain belum diimplementasi — Phase 5.6.</p>
        </SettingsContentCard>
      </SettingsSection>
    </SettingsPageShell>
  );
}
