"use client";

import Loader from "@/components/Loader";
import { ClientSideSuspense, LiveblocksProvider } from "@liveblocks/react/suspense";

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
            <ClientSideSuspense fallback={<Loader />}>
                {children}
            </ClientSideSuspense>
        </LiveblocksProvider>
    );
}