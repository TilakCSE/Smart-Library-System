import { useSearchParams } from "react-router-dom";
import LibraryDigitalTwin from "@/components/LibraryDigitalTwin";

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target") || undefined;

  return <LibraryDigitalTwin targetLocation={target} />;
}