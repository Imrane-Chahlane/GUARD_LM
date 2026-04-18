export function MiniBarChart({
  data
}: {
  data: Array<{
    label: string;
    value: number;
  }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-lg border border-line bg-field p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-cloud/60">Prompt volume</p>
          <h2 className="mt-2 text-xl font-black">Last 7 days</h2>
        </div>
        <span className="rounded-md border border-mint/40 bg-mint/10 px-2 py-1 text-xs font-bold uppercase text-mint">
          Live logs
        </span>
      </div>
      <div className="mt-6 flex h-40 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end rounded-md bg-ink">
              <div
                className="w-full rounded-md bg-mint"
                style={{ height: `${Math.max((item.value / max) * 100, item.value ? 10 : 2)}%` }}
                title={`${item.value} prompts`}
              />
            </div>
            <span className="text-xs text-cloud/55">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
