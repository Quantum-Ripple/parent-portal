import api from './Axios';

//announcements API calls
export const fetchEvents = async () => {
  try {
    const response = await api.get("/announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }};

