export function withValidManifest(manifest: any) {
	const { accountAssociation, miniapp, frame, ...rest } = manifest || {};
	const miniappObject =
		("miniapp" in (manifest || {}) && miniapp) ||
		("frame" in (manifest || {}) && frame);
	if (!miniappObject)
		throw new Error("Invalid manifest: miniapp field is required");

	const required = ["version", "name", "homeUrl", "iconUrl"] as const;
	for (const field of required) {
		if (!miniappObject[field])
			throw new Error(`Invalid manifest: ${field} is required`);
	}
	if (miniappObject.version !== "1")
		throw new Error('Invalid manifest: version must be "1"');

	const cleanedMiniapp = Object.fromEntries(
		Object.entries(miniappObject).filter(([key, value]) => {
			if (required.includes(key as any)) return true;
			if (Array.isArray(value)) return value.length > 0;
			return value !== undefined && value !== null && value !== "";
		}),
	);

	const hasValidAA =
		accountAssociation &&
		accountAssociation.header &&
		accountAssociation.payload &&
		accountAssociation.signature;
	if (accountAssociation && !hasValidAA) {
		console.warn(
			"Invalid manifest accountAssociation. Omitting from manifest.",
		);
	}

	return {
		...(hasValidAA ? { accountAssociation: manifest.accountAssociation } : {}),
		miniapp: cleanedMiniapp,
		...rest,
	};
}
