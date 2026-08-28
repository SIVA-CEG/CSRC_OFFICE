export default function StatusBadge({ status }) {
  const normalized = (status || "").trim().toUpperCase();

  const map = {
    PENDING: {
      label: "PENDING",
      cls: "sb--amber",
    },

    PROCESSING: {
      label: "PROCESSING",
      cls: "sb--blue",
    },

    APPROVED: {
      label: "APPROVED",
      cls: "sb--green",
    },

    COMPLETED: {
      label: "COMPLETED",
      cls: "sb--green",
    },

    RETURNED: {
      label: "RETURNED",
      cls: "sb--red",
    },

    LOCKED: {
      label: "LOCKED",
      cls: "sb--purple",
    },

    ASSIGNED: {
      label: "ASSIGNED",
      cls: "sb--purple",
    },

    "ASSIGNED TO SUPERVISOR": {
      label: "ASSIGNED TO SUPERVISOR",
      cls: "sb--blue",
    },

    "ASSIGNED TO DD": {
      label: "ASSIGNED TO DD",
      cls: "sb--amber",
    },

    "ASSIGNED TO DIRECTOR": {
      label: "ASSIGNED TO DIRECTOR",
      cls: "sb--purple",
    },
  };

  const s = map[normalized] || {
    label: normalized || "UNKNOWN",
    cls: "sb--gray",
  };

  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}
