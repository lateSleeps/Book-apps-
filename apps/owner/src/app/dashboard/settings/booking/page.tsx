import {
  SettingsPageShell,
  SettingsSection,
  SettingsSectionHeader,
  SettingsContentCard,
} from '@/features/dashboard/components/settings/layout';

export default function BookingPage() {
  return (
    <SettingsPageShell>
      <SettingsSection>
        <SettingsSectionHeader
          title="Booking App"
          description="Deposit, metode pembayaran, QRIS, rekening bank, kode booking, timeout reservasi, dan konfirmasi otomatis."
        />
        <SettingsContentCard>
          <p className="text-ts-fn text-tx-secondary">Domain belum diimplementasi — Phase 5.7.</p>
        </SettingsContentCard>
      </SettingsSection>
    </SettingsPageShell>
  );
}
