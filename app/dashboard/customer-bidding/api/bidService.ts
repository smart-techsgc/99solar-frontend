import { Bid, LotWithBids,  } from "@/app/lots/bids/type";

export const fetchLotsWithBids = async (): Promise<LotWithBids[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/lots?withBids=true`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch lots with bids");
    
    const data = await response.json();
    return data.map((lot: LotWithBids) => ({
      ...lot,
      bids: Array.isArray(lot.bids)
        ? lot.bids.sort((a: Bid, b: Bid) => b.bid_amount - a.bid_amount)
        : [],
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

export const awardBid = async (
  bidId: string,
  finalPrice: number,
  commission: number
): Promise<Bid> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/bids/${bidId}/award`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ final_price: finalPrice, commission }),
    }
  );

  if (!response.ok) throw new Error("Failed to award bid");
  return response.json();
};