/*
	MiniKit provider, hooks, and SafeArea are inspired by Coinbase OnchainKit (MIT).
	Thanks to the Coinbase/Base team for the original design and patterns.
	This local variant keeps full control over wagmi/Reown while following that approach.
*/
"use client";

import sdk, {
	type Context as FCContext,
	type MiniAppNotificationDetails,
} from "@farcaster/miniapp-sdk";
import React, {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	type PropsWithChildren,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useConnect } from "wagmi";

// Types (aligned with @coinbase/onchainkit minikit)
export type UpdateClientContextParams = {
	details?: MiniAppNotificationDetails | any | null;
	miniAppAdded?: boolean;
};

export type MiniKitOptions = {
	enabled?: boolean;
	notificationProxyUrl?: string;
	autoConnect?: boolean;
};

export type MiniKitProviderProps = PropsWithChildren<MiniKitOptions>;

export type MiniKitContextType = {
	enabled: boolean;
	context: FCContext.MiniAppContext | null;
	updateClientContext: (params: UpdateClientContextParams) => void;
	notificationProxyUrl: string;
	__isMiniKit: boolean;
};

export const MiniKitContext = createContext<MiniKitContextType>({
	enabled: false,
	context: null,
	updateClientContext: () => {},
	notificationProxyUrl: "",
	__isMiniKit: false,
});

// Internal AutoConnect replicating OCK behavior
const FARCASTER_CONNECTOR_TYPES = new Set([
	"farcasterFrame",
	"farcasterMiniApp",
]);
function AutoConnect({
	children,
	enabled = true,
}: PropsWithChildren<{ enabled?: boolean }>) {
	const { isConnected, isConnecting } = useAccount();
	const { connectors, connect } = useConnect();
	const hasAttemptedConnection = useRef(false);
	const connector = connectors[0];
	const { isInMiniApp, isSuccess: isInMiniAppSuccess } = useIsInMiniApp();

	useEffect(() => {
		if (
			!enabled ||
			hasAttemptedConnection.current ||
			!FARCASTER_CONNECTOR_TYPES.has((connector as any)?.type) ||
			!isInMiniAppSuccess
		) {
			return;
		}
		hasAttemptedConnection.current = true;
		async function handleAutoConnect() {
			if (!isInMiniApp || isConnected || isConnecting) return;
			connect({ connector });
		}
		handleAutoConnect();
	}, [
		connectors,
		connect,
		isConnected,
		isConnecting,
		connector,
		enabled,
		isInMiniAppSuccess,
		isInMiniApp,
	]);

	return <>{children}</>;
}

function MiniKitProviderContent({
	children,
	notificationProxyUrl = "/api/notify",
	autoConnect = true,
}: MiniKitProviderProps) {
	const [context, setContext] = useState<FCContext.MiniAppContext | null>(null);

	const updateClientContext = useCallback(
		({ details, miniAppAdded }: UpdateClientContextParams) => {
			setContext((prevContext) => {
				if (!prevContext) return null;
				return {
					...prevContext,
					client: {
						...prevContext.client,
						notificationDetails: details ?? undefined,
						added: miniAppAdded ?? prevContext.client.added,
					},
				};
			});
		},
		[],
	);

	useEffect(() => {
		sdk.on("miniAppAdded", ({ notificationDetails }) => {
			if (notificationDetails) {
				updateClientContext({
					details: notificationDetails,
					miniAppAdded: true,
				});
			}
		});

		sdk.on("miniAppAddRejected", ({ reason }) => {
			console.error("MiniApp add rejected", reason);
		});

		sdk.on("miniAppRemoved", () => {
			updateClientContext({ details: undefined, miniAppAdded: false });
		});

		sdk.on("notificationsEnabled", ({ notificationDetails }) => {
			updateClientContext({ details: notificationDetails });
		});

		sdk.on("notificationsDisabled", () => {
			updateClientContext({ details: undefined });
		});

		async function fetchContext() {
			try {
				const ctx = await sdk.context; // resolves undefined if not in frame
				setContext(ctx as FCContext.MiniAppContext | null);
			} catch (error) {
				console.error("Error fetching context:", error);
			}
		}

		fetchContext();
		return () => {
			sdk.removeAllListeners();
		};
	}, [updateClientContext]);

	const value = useMemo<MiniKitContextType>(
		() => ({
			enabled: true,
			context,
			updateClientContext,
			notificationProxyUrl,
			__isMiniKit: true,
		}),
		[updateClientContext, notificationProxyUrl, context],
	);

	return (
		<MiniKitContext.Provider value={value}>
			<AutoConnect enabled={autoConnect}>{children}</AutoConnect>
		</MiniKitContext.Provider>
	);
}

export function MiniKitProvider({
	children,
	notificationProxyUrl,
	enabled,
	autoConnect,
}: MiniKitProviderProps) {
	if (!enabled) return children as any;
	return (
		<MiniKitProviderContent
			notificationProxyUrl={notificationProxyUrl}
			autoConnect={autoConnect}>
			{children}
		</MiniKitProviderContent>
	);
}

// Hooks
export function useMiniKit() {
	const [isMiniAppReady, setIsMiniAppReady] = useState(false);
	const context = useContext(MiniKitContext);
	if (!context.enabled) {
		throw new Error("MiniKit is not enabled. Please check your provider.");
	}
	const setMiniAppReady = async (
		readyOptions: Parameters<typeof sdk.actions.ready>[0] = {},
	) => {
		sdk.actions.ready(readyOptions as any);
		setIsMiniAppReady(true);
		return context;
	};
	return {
		setMiniAppReady,
		isMiniAppReady,
		context: context.context,
		updateClientContext: context.updateClientContext,
		notificationProxyUrl: context.notificationProxyUrl,
		// Back-compat aliases
		setFrameReady: setMiniAppReady,
		isFrameReady: isMiniAppReady,
	} as const;
}

export function useIsInMiniApp() {
	const { data, ...rest } = useQuery({
		queryKey: ["useIsInMiniApp"],
		queryFn: sdk.isInMiniApp,
	});
	return { ...rest, isInMiniApp: data } as const;
}

// SafeArea component
export type SafeAreaProps = PropsWithChildren<{ asChild?: boolean }>;
export function SafeArea({ children, asChild }: SafeAreaProps) {
	const { context } = useMiniKit();
	const { isInMiniApp } = useIsInMiniApp();

	const safeAreaInsets = useMemo(() => {
		const { top, bottom, left, right } = (context?.client
			?.safeAreaInsets as any) || {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
		};
		return { top, bottom, left, right } as Record<string, number>;
	}, [context]);

	useLayoutEffect(() => {
		if (!isInMiniApp) return;
		Object.entries(safeAreaInsets).forEach(([key, value]) => {
			document.documentElement.style.setProperty(
				`--ock-minikit-safe-area-inset-${key}`,
				`${value}px`,
			);
		});
	}, [safeAreaInsets, isInMiniApp]);

	const paddingStyles = useMemo(
		() => ({
			paddingTop: "var(--ock-minikit-safe-area-inset-top, 0px)",
			paddingRight: "var(--ock-minikit-safe-area-inset-right, 0px)",
			paddingBottom: "var(--ock-minikit-safe-area-inset-bottom, 0px)",
			paddingLeft: "var(--ock-minikit-safe-area-inset-left, 0px)",
		}),
		[],
	);

	if (!isInMiniApp) return children as ReactElement | null;
	if (!children) return null;

	if (asChild) {
		if (!isValidElement(children)) {
			console.warn(
				"SafeArea: children is not a valid element. Returning children as is.",
			);
			return children as any;
		}
		const onlyChild = Children.only(children) as ReactElement<any>;
		const mergedStyle = {
			...(onlyChild.props as any)?.style,
			...paddingStyles,
		};
		return cloneElement(onlyChild as any, { style: mergedStyle } as any);
	}

	return <div style={paddingStyles}>{children}</div>;
}
