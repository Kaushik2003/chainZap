export const WILL_ABI = {
  "address": "0x9339f4839927957aaf6f8a6e0c1731b837d41b565ce53efe531bffc3e429a75e",
  "name": "will",
  "friends": [],
  "exposed_functions": [
    {
      "name": "initialize",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer"
      ],
      "return": []
    },
    {
      "name": "claim",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "address",
        "u64"
      ],
      "return": []
    },
    {
      "name": "claim_single",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "address"
      ],
      "return": []
    },
    {
      "name": "create_will",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "address",
        "u64",
        "address"
      ],
      "return": []
    },
    {
      "name": "get_claimable_wills_for_recipient",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "address",
        "address"
      ],
      "return": [
        "vector\u003C0x9339f4839927957aaf6f8a6e0c1731b837d41b565ce53efe531bffc3e429a75e::will::Will\u003E"
      ]
    },
    {
      "name": "get_will",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "address"
      ],
      "return": [
        "0x1::option::Option\u003C0x9339f4839927957aaf6f8a6e0c1731b837d41b565ce53efe531bffc3e429a75e::will::Will\u003E"
      ]
    },
    {
      "name": "get_will_count_for_recipient",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "address",
        "address"
      ],
      "return": [
        "u64"
      ]
    },
    {
      "name": "get_wills_for_recipient",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "address",
        "address"
      ],
      "return": [
        "vector\u003C0x9339f4839927957aaf6f8a6e0c1731b837d41b565ce53efe531bffc3e429a75e::will::Will\u003E"
      ]
    },
    {
      "name": "initialize_global_registry",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer"
      ],
      "return": []
    },
    {
      "name": "ping",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer"
      ],
      "return": []
    }
  ],
  "structs": [
    {
      "name": "GlobalWillRegistry",
      "is_native": false,
      "is_event": false,
      "abilities": [
        "key"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "recipient_to_owners",
          "type": "0x1::table::Table\u003Caddress, vector\u003Caddress\u003E\u003E"
        }
      ]
    },
    {
      "name": "Will",
      "is_native": false,
      "is_event": false,
      "abilities": [
        "copy",
        "drop",
        "store"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "recipient",
          "type": "address"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "last_ping_time",
          "type": "u64"
        },
        {
          "name": "timeout_secs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "WillState",
      "is_native": false,
      "is_event": false,
      "abilities": [
        "key"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "wills",
          "type": "0x1::table::Table\u003Caddress, 0x9339f4839927957aaf6f8a6e0c1731b837d41b565ce53efe531bffc3e429a75e::will::Will\u003E"
        },
        {
          "name": "balances",
          "type": "0x1::table::Table\u003Caddress, 0x1::coin::Coin\u003C0x1::aptos_coin::AptosCoin\u003E\u003E"
        }
      ]
    }
  ]
} as const