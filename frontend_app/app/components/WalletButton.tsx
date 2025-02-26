"use client";
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from "@reown/appkit/react";
import { buttonClass, message } from "./ButtonClass";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { apiService } from "../services/ApiService";

const WalletButton = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { disconnect } = useDisconnect();

  const signMessage = async () => {
    if (!walletProvider || !address) {
      throw Error("user is disconnected");
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await walletProvider.signMessage(encodedMessage);

    try {
      const pRes = await apiService.postAdmin(address, Array.from(signature));
      if (!pRes.token) {
        throw new Error("Failed to fetch token");
      }

      localStorage.setItem("token", pRes.token);
      enqueueSnackbar(`Message signed successfully!`, { variant: "success" });
      enqueueSnackbar(`Redirecting to admin page`, { variant: "success" });
      router.push("/admin");
    } catch (error) {
      enqueueSnackbar(`Don't need to sign`, { variant: "error" });
    }
  };

  return !isConnected ? (
    <button className={`${buttonClass} flex items-center gap-2`} onClick={() => open()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
      </svg>
      Connect Wallet
    </button>
  ) : (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className={`${buttonClass} flex items-center gap-2`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
        </svg>
        {address?.slice(0, 6)}...{address?.slice(-4)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-chevron-down"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-box w-52"
      >
        <li>
          <button onClick={() => signMessage()} className="text-blue-600 hover:bg-blue-50">
            Sign Message
          </button>
        </li>
        <li>
          <button onClick={() => disconnect()} className="text-blue-600 hover:bg-blue-50">
            Disconnect
          </button>
        </li>
      </ul>
    </div>
  );
};

export default WalletButton;
