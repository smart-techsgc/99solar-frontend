import { Filters, Lot } from "@/app/lots/type";

export const fetchAllLots = async (
  filters: Filters
): Promise<{ data: Lot[]; totalPages: number }> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/lots/alllots?page=${filters.page}&limit=${filters.limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Network response failed");
    
    const { data, totalPages } = await response.json();
    return { data, totalPages: totalPages || 1 };
  } catch (error) {
    console.error("Fetch error:", error);
    return { data: [], totalPages: 1 };
  }
};