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

// @solana-program/tokenで新たにトークンアカウント用のパッケージをインポートします。
import {
  // getInitializeAccount2Instructionはトークンアカウントを初期化する命令を生成する関数です。
  getInitializeAccount2Instruction,
  getInitializeMintInstruction,
  getMintSize,
  // getTokenSizeはトークンアカウント生成時に必要なバイト数を返す関数です。
  getTokenSize,
  TOKEN_PROGRAM_ADDRESS,
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

// ここからトークンアカウントを作成するコードを追加します。
// まずはトークンアカウントのアドレスとして使用するキーペアを生成します。
const tokenAccount = await generateKeyPairSigner();

// ミントアカウントの時と同様にトークンアカウント作成に必要なサイズを取得します。
const tokenAccountSpace = BigInt(getTokenSize());

// 必要なサイズを元にレントフィー免除に必要な最小額を取得します。
const tokenAccountRent = await rpc
  .getMinimumBalanceForRentExemption(tokenAccountSpace)
  .send();

// 次にトークンアカウントを新しく作成する命令を作ります。項目はミントアカウントの時と同じですね。
const createTokenAccountInstruction = getCreateAccountInstruction({
  payer: feePayer,
  newAccount: tokenAccount,
  lamports: tokenAccountRent,
  space: tokenAccountSpace,
  programAddress: TOKEN_PROGRAM_ADDRESS,
});

// トークンアカウントのデータを初期化する命令を作ります。
const initializeTokenAccountInstruction = getInitializeAccount2Instruction({
  // 先ほどトークンアカウント用に作成したキーペアのアドレスを指定します。
  account: tokenAccount.address,
  // ここではどのトークンミントアカウントに紐づけるかを指定します。ミントアカウントのアドレスを指定しましょう。
  mint: mint.address,
  // ownerはこのトークンアカウントを管理するアドレスです。ミントアカウントで発行権限を持つアドレスと同じ手数料支払い者のアドレスを指定します。
  owner: feePayer.address,
});

// トークンアカウントの作成と初期化の命令を配列にまとめます。
const instructions2 = [
  createTokenAccountInstruction,
  initializeTokenAccountInstruction,
];

// トークンアカウント作成用のトランザクションメッセージを作成します。
const tokenAccountMessage = pipe(
  // createTransactionMessage関数でトランザクションメッセージを作成していきます。
  createTransactionMessage({ version: 0 }),
  // ミントアカウントを作った時と同じようにアカウント作成時の手数料を支払うアドレスとトランザクションのブロックハッシュ、最後にトークンアカウント作成の命令を設定します。
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions(instructions2, tx),
);

// ミントアカウント作成時と同じように署名付きのトランザクションメッセージを作成します。
const signedTokenAccountTx =
  await signTransactionMessageWithSigners(tokenAccountMessage);

// そのままではブロックハッシュベースのトランザクションとして認識されないため、
// lifetimeConstraintプロパティを追加してブロックハッシュベースのトランザクションとして扱います。
const signedTokenAccountTxWithBlockhashLifetime =
  signedTokenAccountTx as typeof signedTokenAccountTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信し、confirmedステータスになるのを待ちます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTokenAccountTxWithBlockhashLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const transactionSignature2 = getSignatureFromTransaction(signedTokenAccountTx);

// 最後に作成したトークンアカウントアドレスとトランザクション署名をコンソールに表示します。
console.log("\nToken Account Address:", tokenAccount.address);
console.log("\nTransaction Signature:", transactionSignature2);
