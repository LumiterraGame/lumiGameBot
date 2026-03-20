import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { useWalletModal } from "@/components/WalletModal/useWalletModal";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useWalletModal.getState().close();
});
