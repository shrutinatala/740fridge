import { FridgeWall } from "@/components/fridge-wall";
import { listFridgePhotos } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function Page() {
  const photos = await listFridgePhotos();
  return <FridgeWall photos={photos} />;
}
