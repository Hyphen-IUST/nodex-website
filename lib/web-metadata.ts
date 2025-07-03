export interface WebMetadata {
  id: string;
  maintenance: boolean;
  accepting: boolean;
  created: string;
  updated: string;
}

export async function getWebMetadata(): Promise<WebMetadata | null> {
  try {
    const response = await fetch(
      `${process.env.POCKETBASE_BACKEND_URL}/api/collections/web_metadata/records?sort=-created&perPage=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch web metadata:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0] as WebMetadata;
    }

    return null;
  } catch (error) {
    console.error("Error fetching web metadata:", error);
    return null;
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  const metadata = await getWebMetadata();
  return metadata?.maintenance ?? false;
}

export async function isAcceptingApplications(): Promise<boolean> {
  const metadata = await getWebMetadata();
  return metadata?.accepting ?? true;
}
