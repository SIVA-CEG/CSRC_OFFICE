export default function StatusBadge({ status }) {
  const statusMap = {
    new: {
      className: "badge-new",
      label: "New",
    },
    assigned: {
      className: "badge-assigned",
      label: "Assigned",
    },
    completed: {
      className: "badge-completed",
      label: "Completed",
    },
  };

  const current = statusMap[status] || {
    className: "badge-default",
    label: status || "Unknown",
  };

  return (
    <span className={`badge-status ${current.className}`}>
      {current.label}
    </span>
  );
}