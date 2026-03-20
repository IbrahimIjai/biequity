import { SwapInterface } from "@/components/trade/trade-ui";
import { pageSEO } from "@/lib/seo";
import React from "react";

export const metadata = pageSEO.trade();

function TradePage() {
	return (
		<div>
			<SwapInterface />
		</div>
	);
}

export default TradePage;
