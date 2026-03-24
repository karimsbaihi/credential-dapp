// 0x3A8430a2888BA32B7360cde7b7d7469f427058fd
export const CONTRACT_ADDRESS = "0x588b102D00F284d154fC3B52CCb9036ae15004b9";

export const CONTRACT_ABI = [
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousAdmin",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newAdmin",
					"type": "address"
				}
			],
			"name": "AdminChanged",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "id",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "student",
					"type": "address"
				}
			],
			"name": "CredentialIssued",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "id",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				}
			],
			"name": "CredentialRevoked",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				}
			],
			"name": "IssuerRegistered",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				}
			],
			"name": "IssuerRemoved",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "admin",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newAdmin",
					"type": "address"
				}
			],
			"name": "changeAdmin",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "credentialId",
					"type": "uint256"
				}
			],
			"name": "getCredential",
			"outputs": [
				{
					"components": [
						{
							"internalType": "uint256",
							"name": "id",
							"type": "uint256"
						},
						{
							"internalType": "address",
							"name": "issuer",
							"type": "address"
						},
						{
							"internalType": "address",
							"name": "student",
							"type": "address"
						},
						{
							"internalType": "string",
							"name": "studentEmail",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "credentialType",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "title",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "gradeOrLevel",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "issuedAt",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "valid",
							"type": "bool"
						},
						{
							"internalType": "uint256",
							"name": "startDate",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "endDate",
							"type": "uint256"
						},
						{
							"internalType": "string",
							"name": "description",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "metadataURI",
							"type": "string"
						}
					],
					"internalType": "struct CredentialRegistry.Credential",
					"name": "",
					"type": "tuple"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "student",
					"type": "address"
				}
			],
			"name": "getStudentCredentials",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "isIssuer",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "credentialId",
					"type": "uint256"
				}
			],
			"name": "isValid",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "student",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "studentEmail",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "credentialType",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "gradeOrLevel",
					"type": "string"
				}
			],
			"name": "issueCredential",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				}
			],
			"name": "registerIssuer",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "issuer",
					"type": "address"
				}
			],
			"name": "removeIssuer",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "credentialId",
					"type": "uint256"
				}
			],
			"name": "revokeCredential",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalCredentials",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "credentialId",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "startDate",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "endDate",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "metadataURI",
					"type": "string"
				}
			],
			"name": "updateCredentialMetadata",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]