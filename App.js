import React, { useState, useEffect } from "react";
import "./App.css";
import useWallet from "./hooks/useWallet";
import { 
  createGrantTransaction, 
  getAccountBalance,
  getContractState,
  getContractTransactions,
  APP_ID
} from "./utils/algorand";
import algosdk from "algosdk";

function App() {
  const { address, connectWallet, disconnectWallet, signer } = useWallet();
  
  const [balance, setBalance] = useState("0.000");
  const [algoLocked, setAlgoLocked] = useState("0.000");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (address) { fetchRealData(); }
  }, [address]);

  useEffect(() => {
    const interval = setInterval(() => { fetchRealData(); }, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const fetchRealData = async () => {
    try {
      if (address) {
        const bal = await getAccountBalance(address);
        setBalance(bal);
      }
      const contractData = await getContractState();
      setAlgoLocked(contractData.algoLocked);
      const txns = await getContractTransactions();
      setTransactions(txns);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  const handleCreateGrant = async () => {
    if (!address) { alert("Connect wallet first!"); return; }
    setLoading(true);
    try {
      await createGrantTransaction(address, signer);
      alert("✅ Grant Created On Algorand Blockchain!");
      fetchRealData();
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + err.message);
    }
    setLoading(false);
  };

  const contractAddress = String(algosdk.getApplicationAddress(756430957));

  return (
    <div>
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>

      <nav>
        <div className="logo">Chain<span>Grant</span></div>
        <div className="nav-r">
          <span className="netbadge">● TESTNET</span>
          {address && (
            <span className="netbadge" style={{color:"#00ff88"}}>
              {balance} ALGO
            </span>
          )}
          <button
            className="btn bo bsm"
            onClick={address ? disconnectWallet : connectWallet}
          >
            {address ? address.slice(0,6)+"..."+address.slice(-4) : "🔗 Connect"}
          </button>
        </div>
      </nav>

      <div className="tabs">
        <div className={`tab ${activeTab==="dashboard"?"on":""}`} onClick={()=>setActiveTab("dashboard")}>📊 Dashboard</div>
        <div className={`tab ${activeTab==="milestones"?"on":""}`} onClick={()=>setActiveTab("milestones")}>🎯 Milestones</div>
        <div className={`tab ${activeTab==="transactions"?"on":""}`} onClick={()=>setActiveTab("transactions")}>🔍 Transactions</div>
        <div className={`tab ${activeTab==="dao"?"on":""}`} onClick={()=>setActiveTab("dao")}>🗳️ DAO Voting</div>
      </div>

      <div className="main">

        {activeTab === "dashboard" && (
          <div>
            <h2 className="sec-t">Dashboard</h2>
            <p className="sec-s">Live data from Algorand TestNet</p>
            <div className="grid4">
              <div className="stat">
                <div className="snum">1</div>
                <div className="slabel">Active Grants</div>
              </div>
              <div className="stat">
                <div className="snum" style={{color:"#00ff88"}}>{algoLocked}</div>
                <div className="slabel">ALGO Locked 🔴 LIVE</div>
              </div>
              <div className="stat">
                <div className="snum">{balance}</div>
                <div className="slabel">Your Balance</div>
              </div>
              <div className="stat">
                <div className="snum">{transactions.length}</div>
                <div className="slabel">Total Transactions</div>
              </div>
            </div>
            <div className="card">
              <h3>ChainGrant Escrow Contract</h3>
              <p className="mono muted">APP ID: {APP_ID}</p>
              <p className="mono muted" style={{fontSize:"11px"}}>
                Contract: {contractAddress.slice(0,20)}...
              </p>
              <div className="prog-track">
                <div className="prog-fill" style={{width:"40%"}}></div>
              </div>
              <div style={{display:"flex", gap:"10px", marginTop:"10px"}}>
                <button className="btn bo bsm" onClick={address ? disconnectWallet : connectWallet}>
                  {address ? address.slice(0,6)+"..."+address.slice(-4) : "🔗 Connect"}
                </button>
                <button className="btn bp bsm" onClick={handleCreateGrant} disabled={loading}>
                  {loading ? "⏳ Processing..." : "+ Create Grant"}
                </button>
                <button className="btn bo bsm" onClick={fetchRealData}>
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div>
            <h2 className="sec-t">Milestones</h2>
            <p className="sec-s">Track milestone approvals on-chain</p>
            <div className="card">
              <div className="ms-row cur">
                <div className="ms-circle cur">1</div>
                <div className="ms-inf">
                  <div className="ms-name">Prototype Development</div>
                  <div className="ms-amt">1.0 ALGO</div>
                </div>
                <span className="chip chip-p">PENDING</span>
              </div>
            </div>
            <div className="card" style={{marginTop:"12px"}}>
              <p className="muted">Contract Address (Escrow):</p>
              <p className="mono" style={{fontSize:"12px", color:"#00ff88"}}>
                {contractAddress}
              </p>
              <p className="muted" style={{marginTop:"8px"}}>
                All fund releases happen automatically when milestone is approved on-chain.
              </p>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="sec-t">Transaction Explorer</h2>
            <p className="sec-s">Live transactions from Algorand TestNet</p>
            {transactions.length === 0 ? (
              <div className="card">
                <p className="muted">
                  {address
                    ? "No transactions yet. Create a grant to see transactions here!"
                    : "Connect wallet to see transactions"}
                </p>
              </div>
            ) : (
              transactions.slice(0,5).map((tx, i) => (
                <div className="card" key={i} style={{marginBottom:"8px"}}>
                  <div className="tx-row">
                    <div className="tx-inf">
                      <div className="tx-id">
                        {tx.id ? tx.id.slice(0,16)+"..." : "TX"+i}
                      </div>
                      <div className="tx-det">
                        {tx["tx-type"]==="pay" ? "Payment" : "App Call"} ·{" "}
                        {tx["round-time"]
                          ? new Date(tx["round-time"]*1000).toLocaleTimeString()
                          : "Recent"}
                      </div>
                    </div>
                    <div className="tx-amt" style={{color:"#00ff88"}}>
                      {tx["payment-transaction"]
                        ? (Number(tx["payment-transaction"].amount)/1_000_000).toFixed(3)+" ALGO"
                        : "App Call"}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="card" style={{marginTop:"12px"}}>
              
               <a href={`https://lora.algokit.io/testnet/application/${APP_ID}`}
                target="_blank"
                rel="noreferrer"
                style={{color:"#00ff88"}}
              >
                🔍 View Full Contract on Lora Explorer →
              </a>
            </div>
          </div>
        )}

        {activeTab === "dao" && (
          <div>
            <h2 className="sec-t">DAO Governance</h2>
            <div className="card">
              <h3>Release Milestone 1</h3>
              <div className="vote-bar">
                <div className="vy" style={{width:"70%"}}></div>
                <div className="vn" style={{width:"30%"}}></div>
              </div>
              <p className="muted" style={{margin:"10px 0"}}>70% YES · 30% NO</p>
              <button className="btn bs bsm">👍 Vote YES</button>
              <button className="btn bd bsm" style={{marginLeft:"8px"}}>👎 Vote NO</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;