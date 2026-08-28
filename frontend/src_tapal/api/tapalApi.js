const API_URL = "http://localhost:5100/api/tapals";

export const getTapals = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const addTapal = async (formData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

export const assignTapal = async (tapalNo, data) => {
  const res = await fetch(`${API_URL}/${tapalNo}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const transferTapal = async (tapalNo, data) => {
  const res = await fetch(`${API_URL}/${tapalNo}/transfer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const completeTapal = async (tapalNo) => {
  const res = await fetch(`${API_URL}/${tapalNo}/complete`, {
    method: "PUT",
  });
  return res.json();
};
export const markHardCopyReceived = async (tapalNo, hardCopyReceivedDate) => {
  const res = await fetch(`${API_URL}/${tapalNo}/hard-copy-received`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hardCopyReceivedDate }),
  });

  if (!res.ok) {
    throw new Error("Failed to update hard copy received date");
  }

  return res.json();
};
const SANCTIONS_URL = "http://localhost:5100/api/sanctions";

export const getPendingSanctions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/pending`);
  return res.json();
};

export const getAssignedSanctions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/assigned`);
  return res.json();
};

export const getCompletedSanctions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/completed`);
  return res.json();
};

export const assignSanction = async (id, assigned_to, assign_remarks) => {
  const res = await fetch(`${SANCTIONS_URL}/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to, assign_remarks }),
  });
  return res.json();
};

//const SANCTIONS_URL = "http://localhost:5100/api/sanctions";

export const getPendingReappropriations = async () => {
  const res = await fetch(`${SANCTIONS_URL}/reappropriation/pending`);
  return res.json();
};

export const getAssignedReappropriations = async () => {
  const res = await fetch(`${SANCTIONS_URL}/reappropriation/assigned`);
  return res.json();
};

export const getCompletedReappropriations = async () => {
  const res = await fetch(`${SANCTIONS_URL}/reappropriation/completed`);
  return res.json();
};

export const assignReappropriation = async (
  id,
  assigned_to,
  assign_remarks,
) => {
  const res = await fetch(`${SANCTIONS_URL}/reappropriation/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to, assign_remarks }),
  });
  return res.json();
};

export const getReappropriationById = async (id) => {
  const res = await fetch(`${SANCTIONS_URL}/reappropriation/${id}`);
  return res.json();
};
export const getExtensionById = async (id) => {
  const res = await fetch(`${SANCTIONS_URL}/extensions/${id}`);
  return res.json();
};
export const getPendingExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/extensions/pending`);
  return res.json();
};

export const getAssignedExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/extensions/assigned`);
  return res.json();
};

export const getCompletedExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/extensions/completed`);
  return res.json();
};

export const assignExtension = async (id, assigned_to, assign_remarks) => {
  const res = await fetch(`${SANCTIONS_URL}/extensions/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to, assign_remarks }),
  });
  return res.json();
};
export const getPendingAppointments = async () => {
  const res = await fetch(`${SANCTIONS_URL}/appointments/pending`);
  return res.json();
};
export const getAssignedAppointments = async () => {
  const res = await fetch(`${SANCTIONS_URL}/appointments/assigned`);
  return res.json();
};
export const getCompletedAppointments = async () => {
  const res = await fetch(`${SANCTIONS_URL}/appointments/completed`);
  return res.json();
};
export const getAppointmentById = async (id) => {
  const res = await fetch(`${SANCTIONS_URL}/appointments/${id}`);
  return res.json();
};
export const assignAppointment = async (id, assigned_to, assign_remarks) => {
  const res = await fetch(`${SANCTIONS_URL}/appointments/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to, assign_remarks }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `Failed to assign appointment (${res.status})`,
    );
  }
  return data;
};

export const getPendingFacultyExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/faculty-extensions/pending`);
  return res.json();
};
export const getAssignedFacultyExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/faculty-extensions/assigned`);
  return res.json();
};
export const getCompletedFacultyExtensions = async () => {
  const res = await fetch(`${SANCTIONS_URL}/faculty-extensions/completed`);
  return res.json();
};
export const getFacultyExtensionById = async (id) => {
  const res = await fetch(`${SANCTIONS_URL}/faculty-extensions/${id}`);
  return res.json();
};
export const assignFacultyExtension = async (
  id,
  assigned_to,
  assign_remarks,
) => {
  const res = await fetch(`${SANCTIONS_URL}/faculty-extensions/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_to, assign_remarks }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `Failed to assign staff extension (${res.status})`,
    );
  }
  return data;
};
