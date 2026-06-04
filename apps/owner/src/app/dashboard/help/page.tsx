export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <div
        className="flex items-center justify-center rounded-r20 bg-bg-card p-8 shadow-card"
        style={{ maxWidth: 400, width: '100%', flexDirection: 'column', gap: 12 }}
      >
        <p className="text-ts-cap2 font-semibold uppercase tracking-widest text-tx-secondary">
          Bantuan
        </p>
        <p className="text-center text-ts-fn text-tx-subtle">
          Halaman ini sedang dalam pengembangan.
        </p>
      </div>
    </div>
  );
}
