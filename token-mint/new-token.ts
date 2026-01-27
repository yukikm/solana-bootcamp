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
  // getMintToInstructionはトークンを発行してトークンアカウントに送る命令を生成する関数です。
  getMintToInstruction,
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

// 先ほど作成したAssociated Token Accountに対してトークンを発行してみましょう。
// まずはトークン発行用の命令を生成します。
const mintToInstruction = getMintToInstruction({
  // 対象のトークンミントアカウントのアドレス
  mint: mint.address,
  // トークンを受け取る先のアカウントアドレス
  token: associatedTokenAddress,
  // トークン発行権限を持つアドレス
  mintAuthority: feePayer.address,
  // 発行するトークンの量を設定します。今回は1.00トークンを発行します。
  // トークンミントアカウントを作成するときにdecimalsを9に設定したので、1トークンは1,000,000,000(10億)の最小単位に相当します。
  amount: 1_000_000_000n,
});

// トークン発行用のトランザクションメッセージを作成します。
// 手数料支払い者とブロックハッシュを設定するところは同じで、今回命令には先ほど生成したトークン発行用の命令を含めます。
const mintTxMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([mintToInstruction], tx),
);

// トランザクションメッセージに署名します。
const signedMintTx = await signTransactionMessageWithSigners(mintTxMessage);

// ブロックハッシュの有効期限情報を付与します。
const signedMintTxWithBlockhashLifetime =
  signedMintTx as typeof signedMintTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信し、confirmedステータスになるまで待ちます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedMintTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const mintTransactionSignature = getSignatureFromTransaction(signedMintTx);

// トークン発行が成功したことを確認するログを表示します。
console.log("\nSuccessfully minted 1.0 tokens");
console.log("\nTransaction Signature:", mintTransactionSignature);
