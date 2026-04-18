export function MetricCard({
  label,
  value,
  detail,
  tone = "mint"
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "mint" | "amber" | "ember" | "leaf";
}) {
  const toneClasses = {
    mint: "text-mint",
    amber: "text-amber",
    ember: "text-ember",
    leaf: "text-leaf"
  };

  return (
    <article className="rounded-lg border border-line bg-field p-5">
      <p className="text-sm font-semibold text-cloud/60">{label}</p>
      <p className={`mt-4 text-3xl font-black ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-3 text-sm text-cloud/55">{detail}</p>
    </article>
  );
}
