import api from './axios';


export const fetchEvents = async () => {
  try {
    const response = await api.get("/announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }};

export const fetchEventsById = async (id) => {
  try {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }};
