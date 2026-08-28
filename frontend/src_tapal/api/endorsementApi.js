import axios from "axios";

const API = "http://localhost:5100/api/endorsements";

export const getEndorsementById = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const getPendingEndorsements = async () => {
  const res = await axios.get(`${API}/pending`);
  return res.data;
};

export const getAssignedEndorsements = async () => {
  const res = await axios.get(`${API}/assigned`);
  return res.data;
};

export const getCompletedEndorsements = async () => {
  const res = await axios.get(`${API}/completed`);
  return res.data;
};
