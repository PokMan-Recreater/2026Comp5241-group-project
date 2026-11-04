// Real provider sample, corrected against the listed sources; raw model review is retained separately.
export const example={
  "model": "glm-4-flash-250414",
  "teachingBrief": {
    "audience": "University students with no blockchain background",
    "goal": "Explain the complete flow of a wallet transfer from signing to ledger recording",
    "case": "Alice uses her wallet to sign a transfer of 5 tokens to Bob, which is validated and recorded on the shared ledger.",
    "steps": [
      {
        "heading": "Alice signs the transaction",
        "purpose": "Alice creates a signed message using her private key to authorize the transfer.",
        "layout": "before-after"
      },
      {
        "heading": "Alice broadcasts the signed transaction",
        "purpose": "Alice sends the signed transaction to the peer-to-peer network for processing.",
        "layout": "conversation"
      },
      {
        "heading": "The network validates the transaction",
        "purpose": "Nodes verify the signature and Alice's balance before adding it to a block.",
        "layout": "process"
      },
      {
        "heading": "The block is added to the shared ledger",
        "purpose": "The validated transaction is permanently recorded in the blockchain history.",
        "layout": "before-after"
      },
      {
        "heading": "Understanding private key security",
        "purpose": "The private key is never shared to prevent unauthorized spending of the tokens.",
        "layout": "before-after"
      }
    ]
  },
  "problems": [
    "misconceptions must be 1-2 non-empty strings of at most 300 characters"
  ],
  "lesson": {
    "id": "sample-wallet-transfer",
    "title": "How a wallet transfer reaches the shared ledger",
    "objectives": [
      "Explain why a wallet signs a particular transfer without sharing its private key.",
      "Trace broadcast and validation in a simplified account-based example.",
      "Distinguish a pending request, block inclusion and chain-specific finality."
    ],
    "misconceptions": [
      "A wallet must send its private key to prove ownership. → It creates a signature locally; the private key remains secret.",
      "Pending means permanently confirmed. → Validation, inclusion and finality are different stages; confirmation requirements depend on the chain."
    ],
    "sourceNotes": [
      "Ethereum developer docs: proof-of-stake transaction lifecycle and finality.",
      "Ethereum developer docs: proof-of-work describes a different block production mechanism."
    ],
    "body": "Alice signs the transfer\nAlice selects the transfer amount\nAlice signs with her private key\nA valid digital signature is created\n\nBroadcast to the network\nWallet submits a signed request\nAccepted requests may be relayed\nDelivery to every node is not guaranteed\n\nNetwork validates the transaction\nNodes check signatures and protocol rules\nAccepted requests may enter a pending pool\nInvalid signatures are rejected\n\nRecording on the ledger\nA producer proposes a block\nConsensus rules determine inclusion\nFinality depends on the chain",
    "slides": [
      {
        "heading": "Alice signs the transfer",
        "concept": "Authorization via cryptography",
        "bullets": [
          "Alice selects the transfer amount",
          "Alice signs with her private key",
          "A valid digital signature is created"
        ],
        "script": [
          "Alice wants to send five units to Bob. In this simplified account-based example, her wallet prepares a request containing the recipient and amount. The wallet signs that request locally with her private key.",
          "Peers can verify the signature without receiving the private key. The signature authorizes this particular request; it does not by itself prove the request passes every protocol rule or that the transfer is confirmed."
        ],
        "notes": [
          "The example omits fees from the arithmetic; real transfers must satisfy applicable fee rules.",
          "A private key stays secret. Sharing it may let another person authorize spending."
        ],
        "art": {
          "scene": "phone",
          "items": [
            "Alice's Wallet",
            "Signed Transaction"
          ],
          "story": {
            "layout": "before-after",
            "context": "Alice authorizes a 5 token transfer",
            "actors": [
              {
                "kind": "phone",
                "label": "Alice's Wallet"
              },
              {
                "kind": "document",
                "label": "Signed Transaction"
              }
            ],
            "events": [
              {
                "from": 0,
                "to": 1,
                "action": "Sign the transfer locally",
                "result": "Signed request; the private key stays in the wallet",
                "status": "success"
              }
            ],
            "takeaway": "Authorization is not the same as confirmation."
          }
        }
      },
      {
        "heading": "Broadcast to the network",
        "concept": "Peer-to-peer propagation",
        "bullets": [
          "Wallet submits a signed request",
          "Accepted requests may be relayed",
          "Delivery to every node is not guaranteed"
        ],
        "script": [
          "The wallet submits the signed request to a connected peer. If that peer accepts it, the request may be relayed to other peers across the network.",
          "Propagation takes time. It does not guarantee every node receives, accepts or stores every request. At this stage the wallet may show pending; the transfer is not yet settled."
        ],
        "notes": [
          "Peers can reject or choose not to relay a request.",
          "Broadcast is distribution of a request, not a guarantee of confirmation."
        ],
        "art": {
          "scene": "network",
          "items": [
            "Alice's Wallet",
            "Peer Nodes"
          ],
          "story": {
            "layout": "conversation",
            "context": "Wallet broadcasts a signed transfer",
            "actors": [
              {
                "kind": "phone",
                "label": "Alice's Wallet"
              },
              {
                "kind": "network",
                "label": "Peer Nodes"
              }
            ],
            "events": [
              {
                "from": 0,
                "to": 1,
                "action": "Submit the signed request",
                "result": "A connected peer receives it",
                "status": "normal"
              },
              {
                "from": 1,
                "to": 1,
                "action": "Relay an accepted request",
                "result": "Propagation is not instant or universal",
                "status": "normal"
              }
            ],
            "takeaway": "Broadcast spreads a request; it does not settle the transfer."
          }
        }
      },
      {
        "heading": "Network validates the transaction",
        "concept": "Validation versus confirmation",
        "bullets": [
          "Nodes check signatures and protocol rules",
          "Accepted requests may enter a pending pool",
          "Invalid signatures are rejected"
        ],
        "script": [
          "A receiving node checks the signature and the protocol rules. In an account-based system these can include the available balance, a transaction sequence number and applicable fees. A signature and a sufficient displayed balance alone are not a universal guarantee of validity.",
          "A valid request may enter the node’s local pending pool, waiting for possible block inclusion. As a counterexample, a request with an invalid signature is rejected instead. Passing validation is not the same as being included or finalized."
        ],
        "notes": [
          "The sequence number helps prevent reusing a transaction.",
          "The precise validation rules depend on the blockchain and asset."
        ],
        "art": {
          "scene": "flow",
          "items": [
            "Signed request",
            "Receiving node",
            "Local pending pool"
          ],
          "story": {
            "layout": "process",
            "context": "Compare an accepted request with a bad signature",
            "actors": [
              {
                "kind": "phone",
                "label": "Signed request"
              },
              {
                "kind": "network",
                "label": "Receiving node"
              },
              {
                "kind": "database",
                "label": "Local pending pool"
              }
            ],
            "events": [
              {
                "from": 0,
                "to": 1,
                "action": "Check the protocol rules",
                "result": "Check signature, balance, sequence number and fees",
                "status": "normal"
              },
              {
                "from": 1,
                "to": 2,
                "action": "Accept a valid request",
                "result": "The request waits for possible block inclusion",
                "status": "success"
              },
              {
                "from": 0,
                "to": 1,
                "action": "Counterexample: bad signature",
                "result": "The node rejects this request",
                "status": "blocked"
              }
            ],
            "takeaway": "A validated pending request is not yet a confirmed transfer."
          }
        }
      },
      {
        "heading": "Recording on the ledger",
        "concept": "Inclusion and finality",
        "bullets": [
          "A producer proposes a block",
          "Consensus rules determine inclusion",
          "Finality depends on the chain"
        ],
        "script": [
          "A block producer selects pending transactions and proposes a block. Other participants verify it according to the chain’s consensus rules. Some chains use mining; Ethereum uses proof of stake instead, so block creation is not universally called mining.",
          "Inclusion is another stage, not an unconditional promise that history can never change. Confirmation and finality rules depend on the chain; a block may be reorganized before the relevant finality conditions are met.",
          "Our example shows five units moving from Alice to Bob, omitting fees from the arithmetic. In a real transfer, the wallet should report the status required by that chain rather than treating pending, included and finalized as interchangeable."
        ],
        "notes": [
          "Shared records are protected by protocol and consensus rules, not by a universal guarantee of instant permanence.",
          "Use the blockchain’s actual confirmation policy when deciding a transfer is settled."
        ],
        "art": {
          "scene": "chain",
          "items": [
            "Proposed block",
            "Shared ledger"
          ],
          "story": {
            "layout": "before-after",
            "context": "From a proposed block to chain-specific confirmation",
            "actors": [
              {
                "kind": "block",
                "label": "Proposed block"
              },
              {
                "kind": "chain",
                "label": "Shared ledger"
              }
            ],
            "events": [
              {
                "from": 0,
                "to": 1,
                "action": "Propose and verify a block",
                "result": "A valid block may be included under consensus rules",
                "status": "success"
              },
              {
                "from": 1,
                "to": 1,
                "action": "Apply the confirmation policy",
                "result": "Finality requirements depend on the chain",
                "status": "normal"
              }
            ],
            "takeaway": "Pending, included and finalized describe different states."
          }
        }
      }
    ],
    "scene": "phone",
    "sceneItems": [
      "Alice's Wallet",
      "Signed Transaction"
    ],
    "questions": [
      {
        "id": "q-1",
        "prompt": "What should leave Alice’s wallet when authorizing this request?",
        "options": [
          "The signed request, while the private key stays secret.",
          "The private key, so each peer can sign for Alice.",
          "An instruction to skip protocol checks."
        ],
        "correctIndex": 0,
        "explanation": "Peers can verify a signature without receiving Alice’s private key. Authorization still does not guarantee validation or confirmation."
      },
      {
        "id": "q-2",
        "prompt": "Which statement correctly describes a pending transfer?",
        "options": [
          "Every node has permanently recorded it.",
          "It may be waiting for inclusion; validation, inclusion and finality are distinct.",
          "It must already have reached finality."
        ],
        "correctIndex": 1,
        "explanation": "A pending request is not automatically included or finalized. The required confirmations depend on the chain."
      }
    ]
  },
  "initialQualityReview": {
    "pass": false,
    "issues": [
      {
        "slide": 0,
        "problem": "The script incorrectly states that the private key 'is a secret cryptographic key' without explaining its role in creating a digital signature."
      },
      {
        "slide": 1,
        "problem": "The script does not mention that network propagation does not guarantee every node receives or stores every transaction, which is a key aspect of blockchain's distributed nature."
      },
      {
        "slide": 2,
        "problem": "The script omits the importance of protocol rules and fees in transaction validity, only focusing on signature and balance."
      },
      {
        "slide": 3,
        "problem": "The script does not clarify that 'mining' in this context refers to specialized nodes creating blocks, which may be unclear to beginners."
      },
      {
        "slide": -1,
        "problem": "The lesson objectives mention 'Explain wallet signing of a transfer' but the misconceptions section focuses on the private key, which could be misaligned."
      }
    ]
  },
  "qualityReview": {
    "pass": false,
    "issues": [
      {
        "slide": 0,
        "problem": "The script incorrectly states that the private key 'is a secret cryptographic key' without explaining its role in creating a digital signature."
      },
      {
        "slide": 1,
        "problem": "The script does not mention that network propagation does not guarantee every node receives or stores every transaction, which is a key aspect of blockchain's distributed nature."
      },
      {
        "slide": 2,
        "problem": "The script omits the importance of protocol rules and fees in transaction validity, only focusing on signature and balance."
      },
      {
        "slide": 3,
        "problem": "The script does not clarify that 'mining' in this context refers to specialized nodes creating blocks, which may be unclear to beginners."
      },
      {
        "slide": -1,
        "problem": "The lesson objectives mention 'Explain wallet signing of a transfer' but the misconceptions section focuses on the private key, which could be misaligned."
      }
    ]
  },
  "reviewModel": "glm-4-flash-250414",
  "referenceSources": [
    "https://ethereum.org/developers/docs/consensus-mechanisms/pos/",
    "https://ethereum.org/developers/docs/consensus-mechanisms/pow/"
  ],
  "manualReview": {
    "completed": true,
    "note": "Corrected universal propagation, mining and finality claims against official Ethereum references; synchronized narration, diagrams and questions."
  }
};
