import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig.js";
import "./App.css";

function App() {
  // Roles
  const [isAdmin, setIsAdmin] = useState(false);
  const [isIssuer, setIsIssuer] = useState(false);
  const [roleLabel, setRoleLabel] = useState("Viewer");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const [activeTab, setActiveTab] = useState("issuer");

  

  // Issuer form state
  const [studentAddress, setStudentAddress] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [credentialType, setCredentialType] = useState("COURSE");
  const [title, setTitle] = useState("");
  const [gradeOrLevel, setGradeOrLevel] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [metadataURI, setMetadataURI] = useState("");

  const [lastIssuedId, setLastIssuedId] = useState(null);

  // Verify state
  const [verifyId, setVerifyId] = useState("");
  const [verifiedCredential, setVerifiedCredential] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");

  // Admin / student extra state
  const [adminTargetAddress, setAdminTargetAddress] = useState("");
  const [myCredentialIds, setMyCredentialIds] = useState([]);
  const [myCredentials, setMyCredentials] = useState([]);

  // -------- Helpers --------

  const toTimestamp = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 0;
    return Math.floor(d.getTime() / 1000);
  };

  const getEtherscanUrl = (address, type = "address") => {
    const baseUrl = "https://sepolia.etherscan.io";
    if (type === "tx") return `${baseUrl}/tx/${address}`;
    return `${baseUrl}/address/${address}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatusMessage("Copied to clipboard!");
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // -------- Student: load my credentials --------

  const loadMyCredentials = async (addr, _contract) => {
    if (!addr || !_contract) return;
    try {
      const ids = await _contract.getStudentCredentials(addr);
      setMyCredentialIds(ids);

      const list = [];
      for (let i = 0; i < ids.length; i++) {
        const idNum = Number(ids[i]);
        const cred = await _contract.getCredential(idNum);
        const valid = await _contract.isValid(idNum);
        list.push({ id: idNum, cred, valid });
      }
      setMyCredentials(list);
    } catch (err) {
      console.error("Error loading my credentials:", err);
    }
  };

  // -------- Connect MetaMask --------

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask extension.");
      return;
    }
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();

      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        _signer
      );

      try {
        const adminAddr = await _contract.admin();
        const issuerFlag = await _contract.isIssuer(_account);
        const adminFlag = adminAddr.toLowerCase() === _account.toLowerCase();

        let label = "Viewer";
        if (adminFlag && issuerFlag) label = "Admin & Issuer";
        else if (adminFlag) label = "Admin";
        else if (issuerFlag) label = "Issuer";

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);
        setIsAdmin(adminFlag);
        setIsIssuer(issuerFlag);
        setRoleLabel(label);

        await loadMyCredentials(_account, _contract);
      } catch (contractErr) {
        console.error("Contract interaction error:", contractErr);
        alert(
          "Connected to wallet, but failed to interact with the contract.\n\n" +
            "Possible issues:\n" +
            "• Wrong network (check if you're on the correct blockchain)\n" +
            "• Contract not deployed at this address\n" +
            "• Network connection issues\n\n" +
            "Error: " +
            (contractErr.message || contractErr)
        );
        return;
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      if (err.code === 4001) {
        alert("Connection request rejected. Please approve the connection in MetaMask.");
      } else if (err.code === -32002) {
        alert("Connection request already pending. Please check MetaMask.");
      } else {
        alert("Failed to connect wallet.\n\n" + "Error: " + (err.message || err));
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setIsAdmin(false);
    setIsIssuer(false);
    setRoleLabel("Viewer");
    setMyCredentialIds([]);
    setMyCredentials([]);
  }, []);

  // -------- Read ?id= from URL for verify tab --------

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    if (idParam) {
      setActiveTab("verify");
      setVerifyId(idParam);
    }
  }, []);

  // -------- Listen for MetaMask account changes --------

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      console.log("MetaMask accounts changed:", accounts);

      if (accounts.length === 0) {
        console.log("No accounts, disconnecting...");
        disconnectWallet();
      } else {
        const newAccount = accounts[0].toLowerCase();
        const currentAccount = account ? account.toLowerCase() : null;

        if (newAccount !== currentAccount) {
          console.log("Account switched from", currentAccount, "to", newAccount);
          disconnectWallet();
          setTimeout(() => {
            connectWallet();
          }, 100);
        }
      }
    };

    const handleChainChanged = (chainId) => {
      console.log("Chain changed to:", chainId);
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, connectWallet, disconnectWallet]);

  // -------- Issue credential --------

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert("Connect wallet first");
      return;
    }
    try {
      setStatusMessage("Issuing credential...");
      const tx = await contract.issueCredential(
        studentAddress,
        studentEmail,
        credentialType,
        title,
        gradeOrLevel
      );
      await tx.wait();

      const total = await contract.totalCredentials();
      const newId = Number(total);
      setLastIssuedId(newId);
      setStatusMessage(`Credential issued with ID ${newId}`);

      if (description || startDate || endDate || metadataURI) {
        const startTs = toTimestamp(startDate);
        const endTs = toTimestamp(endDate);
        const tx2 = await contract.updateCredentialMetadata(
          newId,
          description,
          startTs,
          endTs,
          metadataURI
        );
        await tx2.wait();
        setStatusMessage(`Credential ${newId} issued and metadata updated`);
      }

      if (account === studentAddress) {
        await loadMyCredentials(account, contract);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Error issuing credential");
    }
  };

  // -------- Verify by ID (requires wallet) --------

  const handleVerify = async () => {
    if (!contract) {
      alert("Connect wallet first");
      return;
    }
    if (!verifyId) return;

    try {
      setLoadingVerify(true);
      setStatusMessage("");

      const idNum = Number(verifyId);
      const valid = await contract.isValid(idNum);
      setIsValid(valid);

      const cred = await contract.getCredential(idNum);
      setVerifiedCredential(cred);
    } catch (err) {
      console.error(err);
      setVerifiedCredential(null);
      setIsValid(null);
      setStatusMessage("Credential not found or error");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleRevoke = async () => {
    if (!contract) {
      alert("Connect wallet first");
      return;
    }
    if (!verifyId) return;
    try {
      setStatusMessage("Revoking credential...");
      const idNum = Number(verifyId);
      const tx = await contract.revokeCredential(idNum);
      await tx.wait();
      setStatusMessage(`Credential ${idNum} revoked`);
      const valid = await contract.isValid(idNum);
      setIsValid(valid);

      if (account) {
        await loadMyCredentials(account, contract);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Error revoking credential");
    }
  };

  // -------- Admin: issuer management --------

  const handleRegisterIssuer = async () => {
    if (!contract) {
      alert("Connect wallet first");
      return;
    }
    if (!isAdmin) {
      alert("Only admin can register issuers");
      return;
    }
    if (!adminTargetAddress) {
      alert("Enter an address");
      return;
    }
    try {
      setStatusMessage("Registering issuer...");
      const tx = await contract.registerIssuer(adminTargetAddress);
      await tx.wait();
      setStatusMessage(`Issuer ${adminTargetAddress} registered`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Error registering issuer");
    }
  };

  const handleRemoveIssuer = async () => {
    if (!contract) {
      alert("Connect wallet first");
      return;
    }
    if (!isAdmin) {
      alert("Only admin can remove issuers");
      return;
    }
    if (!adminTargetAddress) {
      alert("Enter an address");
      return;
    }
    try {
      setStatusMessage("Removing issuer...");
      const tx = await contract.removeIssuer(adminTargetAddress);
      await tx.wait();
      setStatusMessage(`Issuer ${adminTargetAddress} removed`);
    } catch (err) {
      console.error(err);
      setStatusMessage("Error removing issuer");
    }
  };

  // Automatically verify if verifyId came from URL (after connect)
  useEffect(() => {
    if (verifyId && contract) {
      handleVerify();
    }
  }, [verifyId, contract]);

  const appBaseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";

  const lastCredentialUrl =
    lastIssuedId != null ? `${appBaseUrl}?id=${lastIssuedId}` : "";

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <h1>Blockchain Credentials DApp</h1>
        </div>
        <div className="header-right">
          {account && <span className="role-pill">{roleLabel}</span>}
          {account ? (
            <>
              <button
                className="connect-btn"
                onClick={() => navigator.clipboard.writeText(account)}
                title="Copy address"
              >
                {account.slice(0, 6)}...{account.slice(-4)}
              </button>
              <button className="secondary-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              Connect MetaMask
            </button>
          )}
        </div>
      </header>

      <nav className="tabs">
        {isIssuer && (
          <button
            className={activeTab === "issuer" ? "tab active" : "tab"}
            onClick={() => setActiveTab("issuer")}
          >
            Issuer
          </button>
        )}
        <button
          className={activeTab === "verify" ? "tab active" : "tab"}
          onClick={() => setActiveTab("verify")}
        >
          Verify
        </button>
        {isAdmin && (
          <button
            className={activeTab === "admin" ? "tab active" : "tab"}
            onClick={() => setActiveTab("admin")}
          >
            Admin
          </button>
        )}
      </nav>

      {statusMessage && <p className="status">{statusMessage}</p>}

      {activeTab === "issuer" && (
        <section className="card">
          <h2>Issue Credential</h2>
          <form onSubmit={handleIssue} className="form-grid">
            <label>
              Student address
              <input
                type="text"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="0x..."
                required
              />
            </label>
            <label>
              Student email
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </label>
            <label>
              Type
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
              >
                <option value="COURSE">COURSE</option>
                <option value="COMPETITION">COMPETITION</option>
                <option value="PROJECT">PROJECT</option>
                <option value="INTERNSHIP">INTERNSHIP</option>
              </select>
            </label>
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blockchain Fundamentals"
                required
              />
            </label>
            <label>
              Grade / Level
              <input
                type="text"
                value={gradeOrLevel}
                onChange={(e) => setGradeOrLevel(e.target.value)}
                placeholder="A, 16/20, Winner..."
              />
            </label>
            <label>
              Description (optional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </label>
            <label>
              Start date (optional)
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End/expiry date (optional)
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <label>
              Metadata URI (optional)
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="https:// or ipfs://"
              />
            </label>

            <button type="submit" className="primary-btn">
              Issue credential
            </button>
          </form>

          {lastIssuedId != null && lastCredentialUrl && (
            <div className="qr-block">
              <h3>Last credential</h3>
              <p>ID: {lastIssuedId}</p>
              <p>Verification URL:</p>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <code style={{ flex: 1, wordBreak: "break-all" }}>
                  {lastCredentialUrl}
                </code>
                <button
                  className="secondary-btn"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => copyToClipboard(lastCredentialUrl)}
                  title="Copy verification URL"
                >
                  Copy URL
                </button>
              </div>

              <div className="qr-wrapper">
                <QRCodeCanvas
                  value={lastCredentialUrl}
                  size={160}
                  bgColor="#020617"
                  fgColor="#f9fafb"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === "verify" && (
        <section className="card">
          <h2>Verify Credential</h2>
          <div className="verify-controls">
            <label>
              Credential ID
              <input
                type="number"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                placeholder="Enter ID"
              />
            </label>
            <button className="primary-btn" onClick={handleVerify}>
              Check
            </button>
          </div>

          {loadingVerify && <p>Loading...</p>}

          {isValid !== null && !loadingVerify && (
            <p className={isValid ? "badge valid" : "badge invalid"}>
              {isValid ? "VALID" : "REVOKED / INVALID"}
            </p>
          )}

          {verifiedCredential && (
            <>
              <div className="cred-details">
                <p>
                  <strong>ID:</strong> {String(verifiedCredential.id)}
                </p>
                <p>
                  <strong>Issuer:</strong>{" "}
                  <a
                    href={getEtherscanUrl(verifiedCredential.issuer)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#38bdf8",
                      textDecoration: "underline",
                    }}
                  >
                    {verifiedCredential.issuer.slice(0, 6)}...
                    {verifiedCredential.issuer.slice(-4)}
                  </a>
                </p>
                <p>
                  <strong>Student:</strong>{" "}
                  <a
                    href={getEtherscanUrl(verifiedCredential.student)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#38bdf8",
                      textDecoration: "underline",
                    }}
                  >
                    {verifiedCredential.student.slice(0, 6)}...
                    {verifiedCredential.student.slice(-4)}
                  </a>
                </p>
                <p>
                  <strong>Email:</strong> {verifiedCredential.studentEmail}
                </p>
                <p>
                  <strong>Type:</strong> {verifiedCredential.credentialType}
                </p>
                <p>
                  <strong>Title:</strong> {verifiedCredential.title}
                </p>
                <p>
                  <strong>Grade/Level:</strong>{" "}
                  {verifiedCredential.gradeOrLevel}
                </p>
                <p>
                  <strong>Issued at:</strong>{" "}
                  {new Date(
                    Number(verifiedCredential.issuedAt) * 1000
                  ).toLocaleString()}
                </p>
                {verifiedCredential.startDate > 0 && (
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(
                      Number(verifiedCredential.startDate) * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
                {verifiedCredential.endDate > 0 && (
                  <p>
                    <strong>End/Expiry:</strong>{" "}
                    {new Date(
                      Number(verifiedCredential.endDate) * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
                {verifiedCredential.metadataURI && (
                  <p>
                    <strong>Metadata:</strong>{" "}
                    <a
                      href={verifiedCredential.metadataURI}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {verifiedCredential.metadataURI}
                    </a>
                  </p>
                )}
                {verifiedCredential.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {verifiedCredential.description}
                  </p>
                )}
              </div>

              {isIssuer &&
                verifiedCredential.issuer.toLowerCase() ===
                  account?.toLowerCase() && (
                  <button className="danger-btn" onClick={handleRevoke}>
                    Revoke this credential
                  </button>
                )}
            </>
          )}

          {account && myCredentials.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                borderTop: "1px solid #1f2937",
                paddingTop: "10px",
              }}
            >
              <h3 style={{ fontSize: "1rem", marginBottom: "6px" }}>
                My Credentials
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                These are credentials where your address is the student.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  marginTop: "8px",
                }}
              >
                {myCredentials.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      background: "#020617",
                      marginBottom: "4px",
                      border: "1px solid #1f2937",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem" }}>
                      <div>
                        <strong>ID:</strong> {item.id}{" "}
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            borderRadius: "999px",
                            marginLeft: "4px",
                            backgroundColor: item.valid
                              ? "rgba(22,163,74,0.2)"
                              : "rgba(220,38,38,0.2)",
                            color: item.valid ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          {item.valid ? "VALID" : "REVOKED"}
                        </span>
                      </div>
                      <div>
                        <strong>Type:</strong> {item.cred.credentialType}{" "}
                        <strong>Title:</strong> {item.cred.title}
                      </div>
                    </div>
                    <button
                      className="secondary-btn"
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                      }}
                      onClick={() => {
                        setVerifyId(String(item.id));
                        handleVerify();
                      }}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {activeTab === "admin" && isAdmin && (
        <section className="card">
          <h2>Admin Panel</h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#9ca3af",
              marginBottom: "10px",
            }}
          >
            Manage issuer addresses that are allowed to issue credentials.
          </p>

          <div className="form-grid">
            <label>
              Issuer address
              <input
                type="text"
                value={adminTargetAddress}
                onChange={(e) => setAdminTargetAddress(e.target.value)}
                placeholder="0x..."
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button className="primary-btn" onClick={handleRegisterIssuer}>
              Register issuer
            </button>
            <button className="danger-btn" onClick={handleRemoveIssuer}>
              Remove issuer
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
