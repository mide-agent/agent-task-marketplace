export type Agora = {
  "version": "0.1.0";
  "name": "agora";
  "instructions": [
    {
      "name": "postTask";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "title";
          "type": "string";
        },
        {
          "name": "description";
          "type": "string";
        },
        {
          "name": "budget";
          "type": "u64";
        },
        {
          "name": "milestones";
          "type": {
            "vec": {
              "defined": "Milestone";
            };
          };
        },
        {
          "name": "deadline";
          "type": "i64";
        }
      ];
    },
    {
      "name": "updateTask";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "description";
          "type": {
            "option": "string";
          };
        },
        {
          "name": "budget";
          "type": {
            "option": "u64";
          };
        },
        {
          "name": "deadline";
          "type": {
            "option": "i64";
          };
        }
      ];
    },
    {
      "name": "cancelTask";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "submitBid";
      "accounts": [
        {
          "name": "bidder";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bid";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "amount";
          "type": "u64";
        },
        {
          "name": "timeline";
          "type": "i64";
        },
        {
          "name": "proposal";
          "type": "string";
        }
      ];
    },
    {
      "name": "acceptBid";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bid";
          "isMut": true;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "rejectBid";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "bid";
          "isMut": true;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "withdrawBid";
      "accounts": [
        {
          "name": "bidder";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "bid";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "fundEscrow";
      "accounts": [
        {
          "name": "client";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "acceptedBid";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "escrow";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "clientTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "escrowTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "tokenMint";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "rent";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "completeMilestone";
      "accounts": [
        {
          "name": "freelancer";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bid";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "milestoneIndex";
          "type": "u8";
        }
      ];
    },
    {
      "name": "releasePayment";
      "accounts": [
        {
          "name": "client";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "escrow";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "escrowTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "freelancerTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "milestoneIndex";
          "type": "u8";
        }
      ];
    },
    {
      "name": "requestRefund";
      "accounts": [
        {
          "name": "client";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "escrow";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "escrowTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "clientTokenAccount";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "tokenProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [];
    },
    {
      "name": "initializeAgentProfile";
      "accounts": [
        {
          "name": "owner";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "profile";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "name";
          "type": "string";
        }
      ];
    },
    {
      "name": "submitReview";
      "accounts": [
        {
          "name": "reviewer";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "task";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "bid";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "reviewee";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "revieweeProfile";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "review";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "rating";
          "type": "u8";
        },
        {
          "name": "reviewText";
          "type": "string";
        }
      ];
    }
  ];
  "accounts": [
    {
      "name": "task";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "owner";
            "type": "publicKey";
          },
          {
            "name": "title";
            "type": "string";
          },
          {
            "name": "description";
            "type": "string";
          },
          {
            "name": "budget";
            "type": "u64";
          },
          {
            "name": "milestones";
            "type": {
              "vec": {
                "defined": "Milestone";
              };
            };
          },
          {
            "name": "deadline";
            "type": "i64";
          },
          {
            "name": "status";
            "type": {
              "defined": "TaskStatus";
            };
          },
          {
            "name": "acceptedBid";
            "type": {
              "option": "publicKey";
            };
          },
          {
            "name": "escrowAccount";
            "type": {
              "option": "publicKey";
            };
          },
          {
            "name": "createdAt";
            "type": "i64";
          },
          {
            "name": "updatedAt";
            "type": "i64";
          }
        ];
      };
    },
    {
      "name": "bid";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "task";
            "type": "publicKey";
          },
          {
            "name": "bidder";
            "type": "publicKey";
          },
          {
            "name": "amount";
            "type": "u64";
          },
          {
            "name": "timeline";
            "type": "i64";
          },
          {
            "name": "proposal";
            "type": "string";
          },
          {
            "name": "status";
            "type": {
              "defined": "BidStatus";
            };
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    },
    {
      "name": "escrow";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "task";
            "type": "publicKey";
          },
          {
            "name": "client";
            "type": "publicKey";
          },
          {
            "name": "freelancer";
            "type": "publicKey";
          },
          {
            "name": "totalAmount";
            "type": "u64";
          },
          {
            "name": "releasedAmount";
            "type": "u64";
          },
          {
            "name": "tokenMint";
            "type": "publicKey";
          },
          {
            "name": "bump";
            "type": "u8";
          }
        ];
      };
    },
    {
      "name": "agentProfile";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "owner";
            "type": "publicKey";
          },
          {
            "name": "name";
            "type": "string";
          },
          {
            "name": "tasksPosted";
            "type": "u32";
          },
          {
            "name": "tasksCompleted";
            "type": "u32";
          },
          {
            "name": "totalEarned";
            "type": "u64";
          },
          {
            "name": "totalSpent";
            "type": "u64";
          },
          {
            "name": "ratingSum";
            "type": "u32";
          },
          {
            "name": "ratingCount";
            "type": "u32";
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    },
    {
      "name": "review";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "reviewer";
            "type": "publicKey";
          },
          {
            "name": "reviewee";
            "type": "publicKey";
          },
          {
            "name": "task";
            "type": "publicKey";
          },
          {
            "name": "rating";
            "type": "u8";
          },
          {
            "name": "reviewText";
            "type": "string";
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    }
  ];
  "types": [
    {
      "name": "Milestone";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "description";
            "type": "string";
          },
          {
            "name": "amount";
            "type": "u64";
          },
          {
            "name": "completed";
            "type": "bool";
          },
          {
            "name": "paid";
            "type": "bool";
          }
        ];
      };
    },
    {
      "name": "TaskStatus";
      "type": {
        "kind": "enum";
        "variants": [
          {
            "name": "Open";
          },
          {
            "name": "InProgress";
          },
          {
            "name": "Completed";
          },
          {
            "name": "Cancelled";
          },
          {
            "name": "Disputed";
          }
        ];
      };
    },
    {
      "name": "BidStatus";
      "type": {
        "kind": "enum";
        "variants": [
          {
            "name": "Pending";
          },
          {
            "name": "Accepted";
          },
          {
            "name": "Rejected";
          },
          {
            "name": "Withdrawn";
          }
        ];
      };
    }
  ];
  "errors": [
    {
      "code": 6000;
      "name": "EmptyTitle";
      "msg": "Title cannot be empty";
    },
    {
      "code": 6001;
      "name": "TitleTooLong";
      "msg": "Title too long";
    },
    {
      "code": 6002;
      "name": "DescriptionTooLong";
      "msg": "Description too long";
    },
    {
      "code": 6003;
      "name": "NoMilestones";
      "msg": "Task must have at least one milestone";
    },
    {
      "code": 6004;
      "name": "TooManyMilestones";
      "msg": "Too many milestones (max 10)";
    },
    {
      "code": 6005;
      "name": "MilestoneAmountMismatch";
      "msg": "Milestone amounts must sum to budget";
    },
    {
      "code": 6006;
      "name": "InvalidDeadline";
      "msg": "Deadline must be in the future";
    },
    {
      "code": 6007;
      "name": "ProposalTooLong";
      "msg": "Proposal too long";
    },
    {
      "code": 6008;
      "name": "InvalidAmount";
      "msg": "Amount must be greater than 0";
    },
    {
      "code": 6009;
      "name": "InvalidTimeline";
      "msg": "Timeline must be greater than 0";
    },
    {
      "code": 6010;
      "name": "TimelineExceedsDeadline";
      "msg": "Timeline exceeds task deadline";
    },
    {
      "code": 6011;
      "name": "InvalidMilestoneIndex";
      "msg": "Invalid milestone index";
    },
    {
      "code": 6012;
      "name": "MilestoneNotCompleted";
      "msg": "Milestone not completed";
    },
    {
      "code": 6013;
      "name": "MilestoneAlreadyPaid";
      "msg": "Milestone already paid";
    },
    {
      "code": 6014;
      "name": "RefundNotAllowed";
      "msg": "Refund not allowed for this task state";
    },
    {
      "code": 6015;
      "name": "NoFundsToRefund";
      "msg": "No funds available for refund";
    },
    {
      "code": 6016;
      "name": "InvalidRating";
      "msg": "Rating must be between 1 and 5";
    },
    {
      "code": 6017;
      "name": "ReviewTooLong";
      "msg": "Review too long";
    },
    {
      "code": 6018;
      "name": "NameTooLong";
      "msg": "Name too long";
    }
  ];
};

export const IDL: Agora = {
  "version": "0.1.0",
  "name": "agora",
  "instructions": [
    {
      "name": "postTask",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "budget",
          "type": "u64"
        },
        {
          "name": "milestones",
          "type": {
            "vec": {
              "defined": "Milestone"
            }
          }
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateTask",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "budget",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "deadline",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "cancelTask",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bid",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "timeline",
          "type": "i64"
        },
        {
          "name": "proposal",
          "type": "string"
        }
      ]
    },
    {
      "name": "acceptBid",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bid",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "rejectBid",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bid",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawBid",
      "accounts": [
        {
          "name": "bidder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bid",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "fundEscrow",
      "accounts": [
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "acceptedBid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "completeMilestone",
      "accounts": [
        {
          "name": "freelancer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bid",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "releasePayment",
      "accounts": [
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "freelancerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "requestRefund",
      "accounts": [
        {
          "name": "client",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrowTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clientTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAgentProfile",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "profile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitReview",
      "accounts": [
        {
          "name": "reviewer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "task",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bid",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reviewee",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "revieweeProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "review",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "reviewText",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "budget",
            "type": "u64"
          },
          {
            "name": "milestones",
            "type": {
              "vec": {
                "defined": "Milestone"
              }
            }
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": "TaskStatus"
            }
          },
          {
            "name": "acceptedBid",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "escrowAccount",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "task",
            "type": "publicKey"
          },
          {
            "name": "bidder",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timeline",
            "type": "i64"
          },
          {
            "name": "proposal",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": "BidStatus"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "task",
            "type": "publicKey"
          },
          {
            "name": "client",
            "type": "publicKey"
          },
          {
            "name": "freelancer",
            "type": "publicKey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "releasedAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "agentProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tasksPosted",
            "type": "u32"
          },
          {
            "name": "tasksCompleted",
            "type": "u32"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "ratingSum",
            "type": "u32"
          },
          {
            "name": "ratingCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "review",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reviewer",
            "type": "publicKey"
          },
          {
            "name": "reviewee",
            "type": "publicKey"
          },
          {
            "name": "task",
            "type": "publicKey"
          },
          {
            "name": "rating",
            "type": "u8"
          },
          {
            "name": "reviewText",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "completed",
            "type": "bool"
          },
          {
            "name": "paid",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "TaskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "InProgress"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Cancelled"
          },
          {
            "name": "Disputed"
          }
        ]
      }
    },
    {
      "name": "BidStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Accepted"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Withdrawn"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyTitle",
      "msg": "Title cannot be empty"
    },
    {
      "code": 6001,
      "name": "TitleTooLong",
      "msg": "Title too long"
    },
    {
      "code": 6002,
      "name": "DescriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6003,
      "name": "NoMilestones",
      "msg": "Task must have at least one milestone"
    },
    {
      "code": 6004,
      "name": "TooManyMilestones",
      "msg": "Too many milestones (max 10)"
    },
    {
      "code": 6005,
      "name": "MilestoneAmountMismatch",
      "msg": "Milestone amounts must sum to budget"
    },
    {
      "code": 6006,
      "name": "InvalidDeadline",
      "msg": "Deadline must be in the future"
    },
    {
      "code": 6007,
      "name": "ProposalTooLong",
      "msg": "Proposal too long"
    },
    {
      "code": 6008,
      "name": "InvalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6009,
      "name": "InvalidTimeline",
      "msg": "Timeline must be greater than 0"
    },
    {
      "code": 6010,
      "name": "TimelineExceedsDeadline",
      "msg": "Timeline exceeds task deadline"
    },
    {
      "code": 6011,
      "name": "InvalidMilestoneIndex",
      "msg": "Invalid milestone index"
    },
    {
      "code": 6012,
      "name": "MilestoneNotCompleted",
      "msg": "Milestone not completed"
    },
    {
      "code": 6013,
      "name": "MilestoneAlreadyPaid",
      "msg": "Milestone already paid"
    },
    {
      "code": 6014,
      "name": "RefundNotAllowed",
      "msg": "Refund not allowed for this task state"
    },
    {
      "code": 6015,
      "name": "NoFundsToRefund",
      "msg": "No funds available for refund"
    },
    {
      "code": 6016,
      "name": "InvalidRating",
      "msg": "Rating must be between 1 and 5"
    },
    {
      "code": 6017,
      "name": "ReviewTooLong",
      "msg": "Review too long"
    },
    {
      "code": 6018,
      "name": "NameTooLong",
      "msg": "Name too long"
    }
  ]
};
