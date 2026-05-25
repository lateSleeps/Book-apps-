// Matches the bg-ticket design token (#eeeef2)
const BG_TICKET = '#eeeef2';

interface TicketDividerProps {
  notchColor?: string;
}

export function TicketDivider({ notchColor = BG_TICKET }: TicketDividerProps) {
  return (
    <div className="relative flex items-center my-[2px]">
      <div className="absolute -left-[20px] h-[28px] w-[28px] rounded-full z-10" style={{ backgroundColor: notchColor }} />
      <div className="absolute -right-[20px] h-[28px] w-[28px] rounded-full z-10" style={{ backgroundColor: notchColor }} />
      <svg width="100%" height="2" className="overflow-visible">
        <line x1="0" y1="1" x2="100%" y2="1" stroke="#ddd" strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
