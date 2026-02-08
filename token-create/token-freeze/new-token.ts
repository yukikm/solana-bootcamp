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
  TOKEN_2022_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
  getMintToInstruction,
  getTransferInstruction,
  fetchToken,
  // トークンアカウントをフリーズするための命令を作る関数です。
  getFreezeAccountInstruction,
} from "@solana-program/token-2022";

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
  programAddress: TOKEN_2022_PROGRAM_ADDRESS,
});

// ミントアカウントを初期化する命令の中でフリーズができる権限を追加します。
const initializeMintInstruction = getInitializeMintInstruction({
  mint: mint.address,
  decimals: 9,
  mintAuthority: feePayer.address,
  // freezeAuthorityに今回はトークン発行権限を持つアドレスと同じアドレスを指定します。
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
  programAddress: TOKEN_2022_PROGRAM_ADDRESS,
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
  tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
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
  tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
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

// ここからトークンアカウントをフリーズするコードを追加します

// 最初に作成したアソシエイテッドトークンアカウントをフリーズする命令を作成します
// 対象のアカウント、ミントアドレス、フリーズ権限を持つオーナーアドレスを指定します
const freezeInstruction = getFreezeAccountInstruction({
  account: associatedTokenAddress,
  mint: mint.address,
  owner: feePayer.address,
});

// フリーズトランザクション用の新しいブロックハッシュを取得します
const { value: freezeBlockhash } = await rpc.getLatestBlockhash().send();

// フリーズ用のトランザクションメッセージを作成します。
// これまで同様、手数料支払い者、ブロックハッシュ、最後にフリーズ命令を設定します
const freezeTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(freezeBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([freezeInstruction], tx),
);

// トランザクションメッセージに署名します
const signedFreezeTx = await signTransactionMessageWithSigners(freezeTxMessage);

// このままではトランザクション送信のコードで型定義のエラーが出るのでライフタイム制約の型定義を追加します
const signedFreezeTxWithLifetime = signedFreezeTx as typeof signedFreezeTx & {
  lifetimeConstraint: {
    lastValidBlockHeight: bigint;
  };
};

// トランザクションを送信してconfirmedステータスを待ちます
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedFreezeTxWithLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得してコンソールに表示してみましょう
const freezeTransactionSignature = getSignatureFromTransaction(
  signedFreezeTxWithLifetime,
);

console.log("\nSuccessfully frozen the token account");
console.log("\nTransaction Signature:", freezeTransactionSignature);

// トークンアカウントがフリーズされているか確認するために、再度送金トランザクションを試みます
// 送金命令を作成して
const freezeTransferInstruction = getTransferInstruction({
  source: associatedTokenAddress,
  destination: recipientAssociatedTokenAddress,
  authority: feePayer.address,
  amount: 500_000_000n,
});

// 最新のブロッックハッシュを取得して
const { value: postFreezeBlockhash } = await rpc.getLatestBlockhash().send();

// 送金トランザクションメッセージを作成します
const postFreezeTransferTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(postFreezeBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
);

// そして送金トランザクションメッセージに署名します
const signedPostFreezeTransferTx = await signTransactionMessageWithSigners(
  postFreezeTransferTxMessage,
);

// 型定義のエラーを避けるためにライフタイム制約の型定義を追加します
const signedPostFreezeTransferTxWithLifetime =
  signedPostFreezeTransferTx as typeof signedPostFreezeTransferTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// 最後に送金トランザクションを送信してみます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedPostFreezeTransferTxWithLifetime,
  { commitment: "confirmed" },
);

// 動作確認してみましょう。
// エラーが出て失敗のエラーメッセージが表示されましたね。
// 理由を見てみるとアカウントがフリーズされているため送金できないという内容が含まれてますね。

// このままではエラーが出るので、動作確認用に追加した送金トランザクションのコードはコメントアウトしておきます。
