import React from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { WalletModalProvider } from "@/components/WalletModal/WalletModalProvider";
import { config as wagmiConfig } from "@/lib/wallet";

function AppProviders({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default function App(appProps: AppProps) {
  return <AppProviders {...appProps} />;
}
