# 🔐 SolanaSign – Secure Message Signer  

## **Overview**  
**SolanaSign** is a modern web app that lets users **sign custom messages** with their **Solana wallets** (Phantom, Solflare, Backpack, Trust Wallet, Glow, Exodus, Atomic Wallet).  
The generated signature is a **cryptographic proof of account ownership**, enabling secure authentication and verification **without passwords**.  

## **Features**  
✅ Sign **custom messages** with supported Solana wallets  
✅ **Proof-of-ownership** without exposing private keys  
✅ **Multi-wallet support**: Phantom, Solflare, Backpack, Trust Wallet, Glow, Exodus, Atomic Wallet  
✅ **Works on desktop & mobile**, optimized for in-app browsers  
✅ **Copy signatures instantly** (`bs58` encoding)  
✅ Clean, lightweight UI built with **Tailwind CSS**  
✅ Auto-detect injected providers + **deep link fallback** for mobile  

## **How It Works**  
1. **Connect your wallet** (Phantom, Solflare, Backpack, etc.)  
2. **Enter a custom message** to sign  
3. **Sign the message** securely with your wallet  
4. **Copy and share** the generated `bs58` signature  

## **Tech Stack**  
🛠 **Frontend**: React (TypeScript), Vite, Tailwind CSS  
🔗 **Wallet integration**: native wallet APIs & deep links  
🔐 **Message signing**: Wallet `signMessage` API + `bs58` encoding
