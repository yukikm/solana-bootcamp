import {
  airdropFactory,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

import { getCreateAccountInstruction } from "@solana-program/system";

import {
  getCreateAssociatedTokenInstructionAsync,
  getInitializeAccount2Instruction,
  getInitializeMintInstruction,
  getMintSize,
  getTokenSize,
  TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
  getMintToInstruction,
  getTransferInstruction,
  fetchToken,
  getFreezeAccountInstruction,
  getThawAccountInstruction,
  getBurnCheckedInstruction,
  // トークンアカウントをクローズするための命令をインポートします
  getCloseAccountInstruction,
} from "@solana-program/token";

const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

const feePayer = await generateKeyPairSigner();

await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: feePayer.address,
  lamports: lamports(1_000_000_000n),
  commitment: "confirmed",
});

const mint = await generateKeyPairSigner();

const space = BigInt(getMintSize());

const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

const createAccountInstruction = getCreateAccountInstruction({
  payer: feePayer,
  newAccount: mint,
  lamports: rent,
  space,
  programAddress: TOKEN_PROGRAM_ADDRESS,
});

const initializeMintInstruction = getInitializeMintInstruction({
  mint: mint.address,
  decimals: 9,
  mintAuthority: feePayer.address,
  freezeAuthority: feePayer.address,
});

const instructions = [createAccountInstruction, initializeMintInstruction];

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions(instructions, tx),
);

const signedTransaction =
  await signTransactionMessageWithSigners(transactionMessage);

const signedTransactionWithBlockhashLifetime =
  signedTransaction as typeof signedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransactionWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const transactionSignature = getSignatureFromTransaction(signedTransaction);

console.log("Mint Address:", mint.address);
console.log("\nTransaction Signature:", transactionSignature);

const tokenAccount = await generateKeyPairSigner();

const tokenAccountSpace = BigInt(getTokenSize());

const tokenAccountRent = await rpc
  .getMinimumBalanceForRentExemption(tokenAccountSpace)
  .send();

const createTokenAccountInstruction = getCreateAccountInstruction({
  payer: feePayer,
  newAccount: tokenAccount,
  lamports: tokenAccountRent,
  space: tokenAccountSpace,
  programAddress: TOKEN_PROGRAM_ADDRESS,
});

const initializeTokenAccountInstruction = getInitializeAccount2Instruction({
  account: tokenAccount.address,
  mint: mint.address,
  owner: feePayer.address,
});

const tokenAccountInstructions = [
  createTokenAccountInstruction,
  initializeTokenAccountInstruction,
];

const tokenAccountMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions(tokenAccountInstructions, tx),
);

const signedTokenAccountTx =
  await signTransactionMessageWithSigners(tokenAccountMessage);

const signedTokenAccountTxWithBlockhashLifetime =
  signedTokenAccountTx as typeof signedTokenAccountTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const tokenAccountTransactionSignature =
  getSignatureFromTransaction(signedTokenAccountTx);

console.log("\nToken Account Address:", tokenAccount.address);
console.log("\nTransaction Signature:", tokenAccountTransactionSignature);

const [associatedTokenAddress] = await findAssociatedTokenPda({
  mint: mint.address,
  owner: feePayer.address,
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
});

console.log(
  "\nAssociated Token Account Address:",
  associatedTokenAddress.toString(),
);

const { value: latestBlockhash2 } = await rpc.getLatestBlockhash().send();

const createAtaInstruction = await getCreateAssociatedTokenInstructionAsync({
  payer: feePayer,
  mint: mint.address,
  owner: feePayer.address,
});

const ataTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash2, tx),
  (tx) => appendTransactionMessageInstructions([createAtaInstruction], tx),
);

const ataSignedTransaction = await signTransactionMessageWithSigners(
  ataTransactionMessage,
);

const signedAssociatedTokenAccountTxWithBlockhashLifetime =
  ataSignedTransaction as typeof ataSignedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedAssociatedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const ataTransactionSignature =
  getSignatureFromTransaction(ataSignedTransaction);
console.log("\nTransaction Signature:", ataTransactionSignature);

const mintToInstruction = getMintToInstruction({
  mint: mint.address,
  token: associatedTokenAddress,
  mintAuthority: feePayer.address,
  amount: 1_000_000_000n,
});

const mintTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([mintToInstruction], tx),
);

const signedMintTx = await signTransactionMessageWithSigners(mintTxMessage);

const signedMintTxWithBlockhashLifetime =
  signedMintTx as typeof signedMintTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedMintTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const mintTransactionSignature = getSignatureFromTransaction(signedMintTx);

console.log("\nSuccessfully minted 1.0 tokens");
console.log("\nTransaction Signature:", mintTransactionSignature);

const recipient = await generateKeyPairSigner();

const [recipientAssociatedTokenAddress] = await findAssociatedTokenPda({
  mint: mint.address,
  owner: recipient.address,
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
});

console.log(
  "\nRecipient Associated Token Account Address:",
  recipientAssociatedTokenAddress.toString(),
);

const createRecipientAtaInstruction =
  await getCreateAssociatedTokenInstructionAsync({
    payer: feePayer,
    mint: mint.address,
    owner: recipient.address,
  });

const { value: latestBlockhash3 } = await rpc.getLatestBlockhash().send();

const recipientAtaTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash3, tx),
  (tx) =>
    appendTransactionMessageInstructions([createRecipientAtaInstruction], tx),
);

const recipientAtaSignedTransaction = await signTransactionMessageWithSigners(
  recipientAtaTransactionMessage,
);

const signedRecipientAssociatedTokenAccountTxWithBlockhashLifetime =
  recipientAtaSignedTransaction as typeof recipientAtaSignedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedRecipientAssociatedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const recipientAtaTransactionSignature = getSignatureFromTransaction(
  recipientAtaSignedTransaction,
);
console.log("\nTransaction Signature:", recipientAtaTransactionSignature);

const { value: transferBlockhash } = await rpc.getLatestBlockhash().send();

const transferInstruction = getTransferInstruction({
  source: associatedTokenAddress,
  destination: recipientAssociatedTokenAddress,
  authority: feePayer.address,
  amount: 500_000_000n,
});

const transferTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(transferBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
);

const signedTransferTx =
  await signTransactionMessageWithSigners(transferTxMessage);

const signedTransferTxWithBlockhashLifetime =
  signedTransferTx as typeof signedTransferTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransferTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const transferTransactionSignature =
  getSignatureFromTransaction(signedTransferTx);

console.log("\nTransaction Signature:", transferTransactionSignature);
console.log("\nSuccessfully transferred 0.5 tokens");

const senderTokenAccount = await fetchToken(rpc, associatedTokenAddress, {
  commitment: "confirmed",
});

const recipientTokenAccount = await fetchToken(
  rpc,
  recipientAssociatedTokenAddress,
  {
    commitment: "confirmed",
  },
);

const senderBalance = senderTokenAccount.data.amount;
const recipientBalance = recipientTokenAccount.data.amount;

console.log("\n=== Final Balances ===");
console.log("Sender balance:", Number(senderBalance) / 1_000_000_000, "tokens");
console.log(
  "Recipient balance:",
  Number(recipientBalance) / 1_000_000_000,
  "tokens",
);

const { value: freezeBlockhash } = await rpc.getLatestBlockhash().send();

const freezeInstruction = getFreezeAccountInstruction({
  account: associatedTokenAddress,
  mint: mint.address,
  owner: feePayer.address,
});

const freezeTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(freezeBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([freezeInstruction], tx),
);

const signedFreezeTx = await signTransactionMessageWithSigners(freezeTxMessage);

const signedFreezeTxWithBlockhashLifetime =
  signedFreezeTx as typeof signedFreezeTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedFreezeTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const freezeTransactionSignature = getSignatureFromTransaction(signedFreezeTx);

console.log("\nSuccessfully frozen the token account");
console.log("\nTransaction Signature:", freezeTransactionSignature);

const { value: thawBlockhash } = await rpc.getLatestBlockhash().send();

const thawInstruction = getThawAccountInstruction({
  account: associatedTokenAddress,
  mint: mint.address,
  owner: feePayer.address,
});

const thawTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(thawBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([thawInstruction], tx),
);

const signedThawTx = await signTransactionMessageWithSigners(thawTxMessage);

const signedThawTxWithBlockhashLifetime =
  signedThawTx as typeof signedThawTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedThawTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const thawTransactionSignature = getSignatureFromTransaction(signedThawTx);

console.log("\nSuccessfully thawed the frozen token account");
console.log("\nTransaction Signature:", thawTransactionSignature);

const tokenAccountBefore = await fetchToken(rpc, associatedTokenAddress);
console.log(
  "\nToken balance before burn:",
  Number(tokenAccountBefore.data.amount) / 1_000_000_000,
  "tokens",
);

const { value: burnBlockhash } = await rpc.getLatestBlockhash().send();

const burnInstruction = getBurnCheckedInstruction({
  account: associatedTokenAddress,
  mint: mint.address,
  authority: feePayer.address,
  amount: 500_000_000n,
  decimals: 9,
});

const burnTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(burnBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([burnInstruction], tx),
);

const signedBurnTx = await signTransactionMessageWithSigners(burnTxMessage);

const signedBurnTxWithBlockhashLifetime =
  signedBurnTx as typeof signedBurnTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedBurnTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

const burnTransactionSignature = getSignatureFromTransaction(signedBurnTx);

const tokenAccountAfter = await fetchToken(rpc, associatedTokenAddress);
console.log(
  "\nToken balance after burn:",
  Number(tokenAccountAfter.data.amount) / 1_000_000_000,
  "tokens",
);

console.log("\nSuccessfully burned 0.5 tokens");
console.log("\nTransaction Signature:", burnTransactionSignature);

// レントフィーの払い戻し先アカウントを作成します。こちらのアカウントにクローズしたトークンアカウントのレントフィーを送ります。
const destination = await generateKeyPairSigner();

// クローズトランザクション用の新しいブロックハッシュを取得します
const { value: closeBlockhash } = await rpc.getLatestBlockhash().send();

// トークンアカウントをクローズする命令を作成します
const closeAccountInstruction = getCloseAccountInstruction({
  // accountではクローズするトークンアカウントのアドレスを指定します
  account: associatedTokenAddress,
  // レントフィーの払い戻し先アカウントを指定します
  destination: destination.address,
  // オーナーにはアソシエイティドトークンアカウントの所有者を指定します。今回はfeePayerが所有者なのでfeePayerを指定します
  owner: feePayer,
});

// クローズ用のトランザクションメッセージを作成します。
const closeTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(closeBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([closeAccountInstruction], tx),
);

// トランザクションメッセージに署名します
const signedCloseTx = await signTransactionMessageWithSigners(closeTxMessage);

const signedCloseTxWithBlockhashLifetime =
  signedCloseTx as typeof signedCloseTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信してconfirmedステータスを待ちます
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedCloseTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します
const closeTransactionSignature = getSignatureFromTransaction(signedCloseTx);

// ログも出力しましょう
console.log("\nSuccessfully closed the token account");
console.log("\nTransaction Signature:", closeTransactionSignature);
