type ScheduleBlockProps = {
  title: string;
  startTime: string;
  endTime: string;
  memo: string | null;
  category: {
    name: string;
    color: string;
  };
};

export function ScheduleBlock({
  title,
  startTime,
  endTime,
  memo,
  category,
}: ScheduleBlockProps) {
  return (
    <article className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:grid-cols-[88px_1fr]">
      <div className="text-sm font-semibold text-slate-700">
        {startTime}
        <span className="block text-xs font-medium text-slate-400">
          {endTime}
        </span>
      </div>

      <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <span
          className="absolute left-0 top-4 h-10 w-1 rounded-r"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-base font-semibold text-slate-950">{title}</h4>
            {memo ? <p className="mt-2 text-sm text-slate-500">{memo}</p> : null}
          </div>
          <span
            className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.name}
          </span>
        </div>
      </div>
    </article>
  );
}
