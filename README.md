# 🎓 Blockchain Credentials DApp

[![Sepolia Testnet](https://img.shields.io/badge/Network-Sepolia-blue.svg)](https://sepolia.etherscan.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636.svg?logo=solidity)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-7B3FE4.svg)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A decentralized application for issuing, verifying, and revoking tamper-proof academic and professional credentials on the **Ethereum Sepolia testnet**.

---

## ✨ Features

- **Issue Credentials** — Authorized issuers create blockchain-stored credentials with metadata
- **Public Verification** — Anyone can verify a credential by ID (wallet connection required for reads)
- **Revoke Credentials** — Issuers can invalidate credentials they have issued
- **Role-Based Access Control** — Admin, Issuer, and Viewer roles enforced on-chain
- **QR Code Sharing** — Auto-generated QR codes with shareable verification URLs
- **Student Portfolio** — Students can view all credentials linked to their wallet address
- **Responsive Design** — Works on desktop and mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite |
| **Styling** | Vanilla CSS (dark theme) |
| **Blockchain** | Solidity 0.8.20, Ethereum Sepolia |
| **Web3** | Ethers.js v6, MetaMask |
| **QR Codes** | qrcode.react |

---

## 📂 Project Structure

```
credential-dapp/
├── contracts/
│   └── CredentialRegistry.sol   # Smart contract (Solidity)
├── docs/
│   └── screenshots/             # App screenshots
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx                  # Main DApp component
│   ├── App.css                  # Application styles
│   ├── contractConfig.js        # Contract ABI & address
│   ├── index.css                # Global styles
│   └── main.jsx                 # React entry point
├── index.html
├── package.json
├── vite.config.js
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MetaMask](https://metamask.io/) browser extension
- Sepolia ETH for gas fees ([Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/credential-dapp.git
cd credential-dapp

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

### Deploy the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Copy the contents of `contracts/CredentialRegistry.sol`
3. Compile with Solidity 0.8.20+
4. Deploy to Sepolia testnet via MetaMask
5. Copy the deployed contract address into `src/contractConfig.js`

---

## 🎮 Usage

### Issue a Credential (Issuer)

1. Connect MetaMask (must be a registered issuer)
2. Go to the **Issuer** tab
3. Fill in: student address, email, type, title, grade
4. Click **Issue Credential** → confirm the transaction
5. Share the generated QR code or verification URL

### Verify a Credential (Anyone)

1. Connect MetaMask
2. Go to the **Verify** tab
3. Enter the credential ID
4. View full details and validity status (VALID / REVOKED)

### Admin Panel

- **Register Issuer** — authorize a wallet address to issue credentials
- **Remove Issuer** — revoke issuing privileges

---

## 📜 Smart Contract Functions

| Function | Access | Description |
|---|---|---|
| `issueCredential()` | Issuer | Creates a new credential on-chain |
| `updateCredentialMetadata()` | Issuer | Adds description, dates, metadata URI |
| `revokeCredential()` | Issuer | Marks a credential as revoked |
| `getCredential(id)` | Public | Returns full credential details |
| `isValid(id)` | Public | Returns `true` if valid, `false` if revoked |
| `getStudentCredentials(addr)` | Public | Returns all credential IDs for a student |
| `registerIssuer(addr)` | Admin | Authorizes an address as issuer |
| `removeIssuer(addr)` | Admin | Removes issuer authorization |
| `changeAdmin(addr)` | Admin | Transfers admin role |

---

## 📊 Gas Costs (Sepolia)

| Action | Estimated Gas | Cost |
|---|---|---|
| Issue Credential | ~180,000 | ~0.0007 ETH |
| Revoke Credential | ~90,000 | ~0.0003 ETH |
| Verify (read) | 0 | Free |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙏 Acknowledgments

- Built during **Security Technologies & AI** course — Dr. Noureddine Lasla
- [Remix IDE](https://remix.ethereum.org/), [Etherscan](https://etherscan.io/), [Sepolia Testnet](https://sepolia.dev/)
- React, Vite, and Ethers.js communities
