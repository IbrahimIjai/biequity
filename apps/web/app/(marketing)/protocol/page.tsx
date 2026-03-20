import { pageSEO } from "@/lib/seo"
import { ProtocolUI } from "@/components/protocol/protocol-ui"

export const metadata = pageSEO.protocol()

export default function ProtocolPage() {
  return <ProtocolUI />
}

