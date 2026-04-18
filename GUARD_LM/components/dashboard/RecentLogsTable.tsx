import { Badge } from "@/components/ui/Badge";
import type { LayerName, PromptFinalStatus } from "@/types/analysis";

export function RecentLogsTable({
  logs
}: {
  logs: Array<{
    id: string;
    createdAt: Date;
    originalPrompt: string;
    finalStatus: PromptFinalStatus;
    actionTaken: string;
    triggeredLayers: LayerName[];
  }>;
}) {
  return (
    <div className="rounded-lg border border-line bg-field">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-black">Recent logs</h2>
        <p className="mt-1 text-sm text-cloud/55">Newest analyzed prompts from your workspace.</p>
      </div>
      <div className="table-scroll">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-ink text-xs uppercase text-cloud/50">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Prompt</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Layers</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-cloud/50" colSpan={5}>
                  No prompts analyzed yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-5 py-4 text-cloud/60">
                    {log.createdAt.toLocaleString()}
                  </td>
                  <td className="max-w-md px-5 py-4 text-cloud/80">
                    <span className="line-clamp-2">{log.originalPrompt}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={log.finalStatus}>{log.finalStatus}</Badge>
                  </td>
                  <td className="px-5 py-4 text-cloud/65">
                    {log.triggeredLayers.length ? log.triggeredLayers.join(", ") : "none"}
                  </td>
                  <td className="px-5 py-4 text-cloud/65">{log.actionTaken}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
