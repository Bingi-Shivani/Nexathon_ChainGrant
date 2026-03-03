import { useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect();

export default function useWallet() {

  const [address, setAddress] = useState(null);

  // CONNECT WALLET
  const connectWallet = async () => {
    try {
      const accounts = await peraWallet.connect();

      setAddress(accounts[0]);

      peraWallet.connector?.on(
        "disconnect",
        disconnectWallet
      );

    } catch (err) {
      console.error(err);
    }
  };

  // DISCONNECT
  const disconnectWallet = async () => {
    peraWallet.disconnect();
    setAddress(null);
  };

  return {
    address,
    connectWallet,
    disconnectWallet,
    signer: peraWallet.signTransaction
  };
}