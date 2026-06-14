"use client";

export type QuestionSectionHeaderProps = {
  title: string;
  required?: boolean;
};

export function QuestionSectionHeader({
  title,
  required = false,
}: QuestionSectionHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-s8 rounded-r12 bg-bg-control/60 px-s16 py-[8px] mb-[12px]">
      <p className="text-[14px] font-semibold text-tx-primary leading-none">
        {title}
      </p>
      {required && (
        <span className="flex-shrink-0 rounded-full bg-c-salmon/10 px-[7px] py-[3px] text-[11px] font-medium text-c-salmon leading-none">
          Wajib
        </span>
      )}
    </div>
  );
}
