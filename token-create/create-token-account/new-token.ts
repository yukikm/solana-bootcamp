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

// @solana-program/token-2022で新たにトークンアカウント用のモジュールをインポートします。
import {
  // getInitializeAccount2Instructionはトークンアカウントを初期化する命令を生成する関数です。
  getInitializeAccount2Instruction,
  getInitializeMintInstruction,
  getMintSize,
  // getTokenSizeはトークンアカウント生成に必要なデータ量を返す関数です。
  getTokenSize,
  TOKEN_2022_PROGRAM_ADDRESS,
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

// ミントアカウントの時と同様にトークンアカウント作成に必要なデータサイズを取得します。
const tokenAccountSpace = BigInt(getTokenSize());

// 必要なサイズを元にトークンアカウントのレントフィー免除に必要な金額を取得します。
const tokenAccountRent = await rpc
  .getMinimumBalanceForRentExemption(tokenAccountSpace)
  .send();

// 次にトークンアカウントを新しく作成する命令を作ります。項目はミントアカウントの時と同じですね。
const createTokenAccountInstruction = getCreateAccountInstruction({
  // payerはトークンアカウント作成時の手数料支払い者です。今回は先ほど作ったfeePayerを指定します。
  payer: feePayer,
  // newAccountは新しく作成するアカウントで、先ほど生成したトークンアカウントキーペアを指定します。
  newAccount: tokenAccount,
  // lamportsはトークンアカウントのレントフィー免除に必要な金額です。
  lamports: tokenAccountRent,
  // spaceはトークンアカウントのデータサイズです。
  space: tokenAccountSpace,
  // programAddressはトークン2022プログラムを指定していきます。
  programAddress: TOKEN_2022_PROGRAM_ADDRESS,
});

// トークンアカウントのデータを初期化する命令を作ります。
const initializeTokenAccountInstruction = getInitializeAccount2Instruction({
  // 先ほどトークンアカウント用に作成したキーペアのアドレスを指定します。
  account: tokenAccount.address,
  // ここではどのトークンミントアカウントに紐づけるかを指定します。ミントアカウントのアドレスを指定しましょう。
  mint: mint.address,
  // ownerはこのトークンアカウントを管理するアドレスです。今回は手数料支払い者のアドレスを指定します。
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

// このままではトランザクションの有効期限がブロックハッシュベースとして認識されず、
// トランザクション送信関数を利用するときに型定義のエラーが出てしまいます。
// 署名したトランザクションメッセージにlifetimeConstraintプロパティを追加して
// 有効期限がブロックハッシュベースのトランザクションとして扱えるようにします。
const signedTokenAccountTxWithLifetime =
  signedTokenAccountTx as typeof signedTokenAccountTx & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信し、トランザクションがconfirmedステータスになるまで待ちます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTokenAccountTxWithLifetime,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const transactionSignature2 = getSignatureFromTransaction(
  signedTokenAccountTxWithLifetime,
);

// 最後に作成したトークンアカウントアドレスとトランザクション署名をコンソールに表示します。
console.log("\nToken Account Address:", tokenAccount.address);
console.log("Transaction Signature:", transactionSignature2);
