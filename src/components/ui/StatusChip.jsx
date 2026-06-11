/* ============================================================
   StatusChip — RAG status badge
   ============================================================ */
export default function StatusChip({ status, label, size = "md" }) {
  const variant =
    status === "NORMAL" || status === "success"
      ? "success"
      : status === "WARNING" || status === "warning"
        ? "warning"
        : status === "CRITICAL" || status === "danger"
          ? "danger"
          : status === "info"
            ? "info"
            : "accent";

  const display = label || status;

  return (
    <span className={`chip chip-${variant}`} role="status" aria-label={`Status: ${display}`}>
      {display}
    </span>
  );
}
