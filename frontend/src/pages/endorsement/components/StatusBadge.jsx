export default function StatusBadge({ status }) {
  const map = {
    PENDING:   { label: "Pending",   cls: "sb--amber" },
    PROCESSING:{ label: "Processing",cls: "sb--blue"  },
    APPROVED:  { label: "Approved",  cls: "sb--green" },
    RETURNED:  { label: "Returned",  cls: "sb--red"   },
    LOCKED:    { label: "Locked",    cls: "sb--purple" },
  };
  const s = map[status] || { label: status, cls: "sb--gray" };
  return (
    <span className={`status-badge ${s.cls}`}>{s.label}</span>
  );
}