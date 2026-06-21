// Solana RPC & wallet helpers
// Paste your code here

import { Connection } from "@solana/web3.js";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_RPC!;

export const connection = new Connection(RPC_ENDPOINT, "confirmed");

// Add your Solana helper functions below
