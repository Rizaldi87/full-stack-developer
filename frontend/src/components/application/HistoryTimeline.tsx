import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getHistory } from "../../api/applications";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { getErrorMessage } from "../../api/client";
import { Badge } from "../ui/Badge";
import { applicationStatusColor, formatDate, statusLabel } from "../../utils/format";

export default function HistoryTimeline({ applicationId }: { applicationId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["application-history", applicationId],
    queryFn: () => getHistory(applicationId),
    enabled: expanded,
  });
  if (!expanded) {
    return (
      <Button type="button" variant="secondary" className="mt-3" onClick={() => setExpanded(true)}>
        Riwayat
      </Button>
    );
  }
  const history = data?.data?.history;
  return (
    <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Riwayat Status</h3>
        <Button type="button" variant="secondary" className="px-3! py-1!" onClick={() => setExpanded(false)}>
          Sembunyikan
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError || !history ? (
        <p className="mt-2 text-sm text-red-600">{getErrorMessage(error, "Gagal memuat riwayat")}</p>
      ) : history.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Belum ada riwayat.</p>
      ) : (
        <ol className="mt-3 space-y-4 border-l-2 border-gray-200 pl-4">
          {[...history].reverse().map((item) => (
            <li key={item.id} className="relative">
              <span className={`absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full ${applicationStatusColor(item.toStatus)}`} />
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={applicationStatusColor(item.toStatus)}>{item.fromStatus ? `${statusLabel(item.fromStatus)} → ${statusLabel(item.toStatus)}` : statusLabel(item.toStatus)}</Badge>
                <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
              </div>
              {item.note && <p className="mt-1 text-sm italic text-gray-600">“{item.note}”</p>}
              <p className="mt-0.5 text-xs text-gray-500">oleh: {item.changedBy.name}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
