import { Profile } from "@/types";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getProfile = async (user_id: string): Promise<Profile> => {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user_id": user_id,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Error fetching user profile:", data.message || "Unknown error");
      throw new Error(data.message || "Unknown error");
    }

    const data = await response.json();
    return data as Profile;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
