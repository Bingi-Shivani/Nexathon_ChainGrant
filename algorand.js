import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

export const APP_ID = 756430957;

// Get real wallet balance from blockchain
export async function getAccountBalance(address) {
  try {
    const info = await algodClient.accountInformation(address).do();
    return (Number(info.amount) / 1_000_000).toFixed(3);
  } catch (err) {
    console.error(err);
    return "0.000";
  }
}

// Get real contract state from blockchain
export async function getContractState() {
  try {
    const appInfo = await algodClient.getApplicationByID(APP_ID).do();
    const globalState = appInfo.params["global-state"] || [];
    
    const state = {};
    globalState.forEach(item => {
      const key = atob(item.key);
      const value = item.value.type === 1
        ? atob(item.value.bytes)
        : item.value.uint;
      state[key] = value;
    });

    // Get contract ALGO balance (locked funds)
    const appAddress = algosdk.getApplicationAddress(APP_ID);
    const appAccount = await algodClient.accountInformation(appAddress).do();
    const algoLocked = (Number(appAccount.amount) / 1_000_000).toFixed(3);

    return {
      algoLocked,
      state
    };
  } catch (err) {
    console.error("Contract state error:", err);
    return { algoLocked: "0.000", state: {} };
  }
}

// Get real transactions for this contract
export async function getContractTransactions() {
  try {
    const appAddress = algosdk.getApplicationAddress(APP_ID);
    const response = await fetch(
      `https://testnet-idx.algonode.cloud/v2/accounts/${appAddress}/transactions?limit=10`
    );
    const data = await response.json();
    return data.transactions || [];
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return [];
  }
}

// Create grant transaction
export const createGrantTransaction = async (sender, signer) => {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender,
    appIndex: APP_ID,
    suggestedParams: params,
    appArgs: [new TextEncoder().encode("create_grant")]
  });

  const signedTxn = await signer([txn]);
  const txId = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId.txId, 4);
  return txId;
};

export { algodClient };