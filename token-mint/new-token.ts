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
  // getCreateAssociatedTokenInstructionAsyncはAssociated Token Accountを作成する命令を生成する非同期関数です。
  getCreateAssociatedTokenInstructionAsync,
  getInitializeAccount2Instruction,
  getInitializeMintInstruction,
  getMintSize,
  getTokenSize,
  TOKEN_PROGRAM_ADDRESS,
  // findAssociatedTokenPdaはミントアドレスとウォレットアドレス、今回はトークン発行者権限を持つアドレスからAssociated Token Accountのアドレスを導出する関数です。
  findAssociatedTokenPda,
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

// まずfindAssociatedTokenPdaを使用してAssociated Token Accountアドレスを導出してみましょう。
// 今回は最初に作成したミントアドレスとトークン発行者権限を持つfeePayerのアドレスを使用して導出してみます。
const [associatedTokenAddress] = await findAssociatedTokenPda({
  mint: mint.address,
  owner: feePayer.address,
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
});

// 実際に動作させてみましょう。このように簡単に導出することができます。
console.log(
  "\nAssociated Token Account Address:",
  associatedTokenAddress.toString(),
);

// ここからは実際にAssociated Token Accountを作成してみます。
// 2つ目のトランザクション用に新しいブロックハッシュを取得します。
const { value: latestBlockhash2 } = await rpc.getLatestBlockhash().send();

// Associated Token Accountを作成する命令を生成します。getCreateAssociatedTokenInstructionAsyncは非同期関数なのでawaitで呼び出します。
// トークン発行者権限を持つfeePayerのアドレスと最初に作成したMintアカウントからAssociated Token Accountを作成します。
// 手数料支払い者は今回はこのアドレスのオーナーとします。
const createAtaInstruction = await getCreateAssociatedTokenInstructionAsync({
  payer: feePayer,
  mint: mint.address,
  owner: feePayer.address,
});

// トランザクションメッセージを作成します。
// 手数料支払い者とブロックハッシュを設定するところは同じです。
// 今回はAssociated Token Accountを作成する命令ををトランザクションメッセージに含めます。
const ataTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash2, tx),
  (tx) => appendTransactionMessageInstructions([createAtaInstruction], tx),
);

// トランザクションメッセージに署名します。
const ataSignedTransaction = await signTransactionMessageWithSigners(
  ataTransactionMessage,
);

// ブロックハッシュの有効期限情報を付与します。
const signedAssociatedTokenAccountTxWithBlockhashLifetime =
  ataSignedTransaction as typeof ataSignedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信し、confirmedステータスになるまで待ちます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedAssociatedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const ataTransactionSignature =
  getSignatureFromTransaction(ataSignedTransaction);
console.log("\nTransaction Signature:", ataTransactionSignature);
