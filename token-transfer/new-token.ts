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
  // getTransferInstructionはトークンを別のアカウントに送金する命令を生成する関数です。
  getTransferInstruction,
  // fetchTokenはトークンアカウントの情報を取得する関数です。実際に送金されたか確認するために使用します。
  fetchToken,
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

// トークン転送を確認するためにトークンを受け取るための新しいアカウントを作成していきます。
const recipient = await generateKeyPairSigner();

// 受け取り手のAssociated Token Accountを導出します。
const [recipientAssociatedTokenAddress] = await findAssociatedTokenPda({
  // トークンミントアドレス、受け取りてのウォレットアドレス、トークンプログラムアドレスを指定してPDAを導出します。
  mint: mint.address,
  owner: recipient.address,
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
});

console.log(
  "\nRecipient Associated Token Account Address:",
  recipientAssociatedTokenAddress.toString(),
);

// 受け取り手のAssociated Token Accountを作成する命令を生成します。
const createRecipientAtaInstruction =
  await getCreateAssociatedTokenInstructionAsync({
    payer: feePayer,
    mint: mint.address,
    owner: recipient.address,
  });

// 受け取りてのAssociated Token Accountを作成するトランザクションメッセージを構築します。
// 以前実施したAssociated Token Accountの作成と同様の手順です。
const { value: latestBlockhash3 } = await rpc.getLatestBlockhash().send();

const recipientAtaTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash3, tx),
  (tx) =>
    appendTransactionMessageInstructions([createRecipientAtaInstruction], tx),
);

// トランザクションメッセージに署名します。
const recipientAtaSignedTransaction = await signTransactionMessageWithSigners(
  recipientAtaTransactionMessage,
);

const signedRecipientAssociatedTokenAccountTxWithBlockhashLifetime =
  recipientAtaSignedTransaction as typeof recipientAtaSignedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// 受け取り手のAssociated Token Accountを作成するトランザクションを送信し、confirmedステータスになるまで待機します。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedRecipientAssociatedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// ログにトランザクションシグネチャを出力します。
const recipientAtaTransactionSignature = getSignatureFromTransaction(
  recipientAtaSignedTransaction,
);
console.log("\nTransaction Signature:", recipientAtaTransactionSignature);

// npx tsx new-token.tsも実行して動作確認しましょう。
// 受け取り手のAssociated Token Accountも作成できてますね。

// それでは、いよいよトークンの送金を行います。
// 送金トランザクション用の新しいブロックハッシュを取得します。
const { value: transferBlockhash } = await rpc.getLatestBlockhash().send();

// getTransferInstruction関数を使ってトークン送金用の命令を生成します。
const transferInstruction = getTransferInstruction({
  // sourceには送金元のAssociated Token Accountアドレスを指定します。
  source: associatedTokenAddress,
  // destinationには送金先のAssociated Token Accountアドレスを指定します。
  destination: recipientAssociatedTokenAddress,
  // authorityには送金元アカウントのオーナーアドレスを指定します。
  authority: feePayer.address,
  // 先ほど1.0トークンを発行したので、半分の0.5トークンを送金します。
  amount: 500_000_000n,
});

// トークン送金用のトランザクションメッセージを作成します。
// feePayer、ブロックハッシュの設定はこれまで同様で、今回は直前で作ったtransferInstruction命令を追加します。
const transferTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(transferBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
);

// 送金トランザクションメッセージに署名します。
const signedTransferTx =
  await signTransactionMessageWithSigners(transferTxMessage);

const signedTransferTxWithBlockhashLifetime =
  signedTransferTx as typeof signedTransferTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// 実際に送金トランザクションを送信し、confirmedステータスになるまで待機します。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransferTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const transferTransactionSignature =
  getSignatureFromTransaction(signedTransferTx);

// 送金が成功したことをログに出力します。
console.log("\nTransaction Signature:", transferTransactionSignature);
console.log("\nSuccessfully transferred 0.5 tokens");

// トークン送金が正しく行われたか確認するために、送金元と送金先のAssociated Token Accountの残高を取得します。
// fetchToken関数を使ってAssociated Token Accountの情報を取得します。
// 第一引数にはRPCクライアント、第二引数にトークンアカウントアドレスを指定します。
// 送金された後の状態を見たいので、confirmedステータスのデータを取得します。
const senderTokenAccount = await fetchToken(rpc, associatedTokenAddress, {
  commitment: "confirmed",
});

// 受け取り手のトークンアカウント情報も同様に取得します。
const recipientTokenAccount = await fetchToken(
  rpc,
  recipientAssociatedTokenAddress,
  {
    commitment: "confirmed",
  },
);

// 取得したトークンアカウント情報からamountフィールドを参照してトークンの残高を確認しましょう。
const senderBalance = senderTokenAccount.data.amount;
const recipientBalance = recipientTokenAccount.data.amount;

// 結果をログに出力します。
// decimalsを9に設定していたので、1_000_000_000(10億)が1トークンに相当します。
console.log("\n=== Final Balances ===");
console.log("Sender balance:", Number(senderBalance) / 1_000_000_000, "tokens");
console.log(
  "Recipient balance:",
  Number(recipientBalance) / 1_000_000_000,
  "tokens",
);
