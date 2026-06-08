const API_URL = "http://localhost:5000/api/tapals";

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