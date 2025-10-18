import { withValidManifest } from "../../../providers/minikit-manifest";
import { minikitConfig } from "../../../minikit.config";

export async function GET() {
	return Response.json(withValidManifest(minikitConfig));
}
