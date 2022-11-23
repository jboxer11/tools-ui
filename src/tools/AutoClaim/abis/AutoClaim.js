export default [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "contract IPrizeDistributor",
          "name": "_prizeDistributor",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "_minimumPercentage",
          "type": "uint16"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AllowanceTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AmountOutTooHigh",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AmountOutTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoPayout",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAuthorized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PercentageTooHigh",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PercentageTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenTransferFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "pendingOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipOffered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "bySender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "senderAmountOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "forUser",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "userAmountOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32[]",
          "name": "drawIds",
          "type": "uint32[]"
        }
      ],
      "name": "PrizesClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "percentage",
          "type": "uint16"
        }
      ],
      "name": "UserOptedIn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "UserOptedOut",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "autoClaimUsers",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        },
        {
          "internalType": "uint32[]",
          "name": "_drawIds",
          "type": "uint32[]"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        },
        {
          "internalType": "uint16",
          "name": "_senderPercentage",
          "type": "uint16"
        },
        {
          "internalType": "uint256",
          "name": "_minAmountOut",
          "type": "uint256"
        }
      ],
      "name": "claimFor",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amountToSender",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minimumPercentage",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "_senderPercentage",
          "type": "uint16"
        }
      ],
      "name": "optIn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "optOut",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
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
      "inputs": [],
      "name": "pendingOwner",
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
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint16",
          "name": "_minimumPercentage",
          "type": "uint16"
        }
      ],
      "name": "setMinimumPercentage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
