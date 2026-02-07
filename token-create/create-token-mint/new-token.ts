// まずは必要なパッケージを@solana/kitからインポートしていきます。
import {
  // airdropFactoryはテスト用のSOLを取得するために使用します。
  airdropFactory,
  // appendTransactionMessageInstructionsはトランザクションの中で何をするのか、命令を追加する関数です。
  appendTransactionMessageInstructions,
  // createSolanaRpcは Solana RPC クライアントを作成する関数で指定したRPCエンドポイントに接続します。
  createSolanaRpc,
  // createSolanaRpcSubscriptionsはSolanaノードとWebSocket接続を確立し、リアルタイムでのデータの送受信を可能にします。
  createSolanaRpcSubscriptions,
  // createTransactionMessageはトランザクションを送信するために必要な基本構造を定義する関数です。この関数を使って必要な命令も含めてトランザクションの構造を作ります。
  createTransactionMessage,
  // generateKeyPairSignerは 新しい公開鍵と秘密鍵ペアを作る関数です。
  generateKeyPairSigner,
  // getSignatureFromTransactionは 署名済みトランザクションからTransaction Signatureを取得する関数です。
  getSignatureFromTransaction,
  // lamportsはSOLの最小単位であるlamportを適切に扱うための関数です。今回はテスト用のSOLを取得する時に取得したい量をlamports単位で指定するために使用します。
  lamports,
  // pipeはトランザクションメッセージを作成する時に利用します。複数の命令を含む複雑なトランザクションメッセージを作る時により読みやすいコードを書くことができます。
  pipe,
  // sendAndConfirmTransactionFactoryは実際にトランザクションを送信する関数です。
  sendAndConfirmTransactionFactory,
  // setTransactionMessageFeePayerSignerはトランザクションメッセージを作る時にトランザクション手数料支払い者を設定する関数です。
  setTransactionMessageFeePayerSigner,
  // setTransactionMessageLifetimeUsingBlockhashは 最新のブロックハッシュを使ってトランザクションの有効期限を設定します。
  setTransactionMessageLifetimeUsingBlockhash,
  // signTransactionMessageWithSigners: トランザクションメッセージに署名する関数です。
  signTransactionMessageWithSigners,
} from "@solana/kit";

// @solana-program/systemからも必要なパッケージをインポートします。
import {
  // getCreateAccountInstructionは新しいアカウントを作る関数です。
  getCreateAccountInstruction,
} from "@solana-program/system";

// @solana-program/token-2022からも必要なパッケージをインポートします。
import {
  // getInitializeMintInstructionはトークンMintアカウントを作る時にアカウントの初期化をする命令を生成するために利用します。
  getInitializeMintInstruction,
  // アカウントを作る時に、アカウントに必要なデータ量も指定する必要がありまして、Mintアカウント生成時に必要なデータサイズを返す関数です。
  getMintSize,
  // TOKEN_2022_PROGRAM_ADDRESSは デプロイされているToken 2022 Program のアドレスです。
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

// 必要なパッケージは全てインポートできました。
// ここから実際にトークンミントアカウントを新しく作成していきます。

// まずRPC接続クライアントを作成します。今回はローカルバリデータに接続します。
const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

// トークンミントアカウント作成時の手数料を支払うアドレスのキーペアを生成します。
const feePayer = await generateKeyPairSigner();

// 手数料支払い用アドレスにSOLをエアドロップします。rpcの設定をして、
await airdropFactory({ rpc, rpcSubscriptions })({
  // 手数料支払い者のアドレス
  recipientAddress: feePayer.address,
  // エアドロップするSOLの量を指定します。指定方法は9桁のlamports単位で指定します。今回は1SOL分のlamportsを指定します。
  // lamportsはBigIntで扱う必要があるため、1_000_000_000nとnを付けて指定します。
  lamports: lamports(1_000_000_000n),
  // 最後にcommitmentフィールドを指定して、今回は"confirmed"でエアドロップトランザクションが確実に実行されたことを確認します。
  commitment: "confirmed",
});

// ミントアドレスとして使用するキーペアを生成します。
const mint = await generateKeyPairSigner();

// デフォルトのミントアカウントサイズ（バイト単位）を取得します。
const space = BigInt(getMintSize());

// ミントアカウントを作成する時にレントフィーの支払いが免除されるために必要な最小金額を取得します。
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

// ここからトークンミントアカウントを新しく作成する命令を作っていきます。
const createAccountInstruction = getCreateAccountInstruction({
  // payerはアカウント作成時の手数料支払い者を指定します。
  payer: feePayer,
  // newAccountは新しく作成するアカウントです。今回は先ほどキーペアを作ったミントアドレスを指定します。
  newAccount: mint,
  // lamportsはアカウントに送るSOLの量です。先ほど取得したレントフィー免除に必要な最小額を指定します。
  lamports: rent,
  // spaceはアカウントに割り当てるデータ量です。先ほど取得したミントアカウントサイズを指定します。
  space,
  // programAddressはアカウントを管理するプログラムのアドレスです。インポートしたトークン2022プログラムを指定してアカウントの所有権を渡します。
  programAddress: TOKEN_2022_PROGRAM_ADDRESS,
});

// トークンミントアカウントを作成後に初期化する命令を作っていきます。
const initializeMintInstruction = getInitializeMintInstruction({
  // mintは初期化するミントアカウントのアドレスです。
  mint: mint.address,
  // 10進数で表したトークンの小数点以下の桁数です。今回は9桁に設定します。
  decimals: 9,
  //  mintAuthorityは新しく作成するトークンの発行権限を持つアドレスです。今回は手数料支払い者と同じアドレスに発行権限を与えます。
  mintAuthority: feePayer.address,
});

// 今作ったトークンミントアカウントを作成する命令と初期化する命令を配列にまとめます。
const instructions = [createAccountInstruction, initializeMintInstruction];

// トランザクションの有効期限を設定するために、最新のブロックハッシュを取得してこちらを有効期限として使います。
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// トランザクションに送るメッセージを作成します。
// pipe関数を使ってトランザクションメッセージを作成していきます。
const transactionMessage = pipe(
  // createTransactionMessage関数を使ってトランザクションメッセージの作成を始めます。
  createTransactionMessage({ version: 0 }),
  // 手数料支払い者を設定します。ここで設定したアカウントがトランザクションに署名します。
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  // 次にトランザクションの有効期限を最新のブロックハッシュを使って設定します。
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  // 最後にトークンミントアカウント作成、初期化の命令を追加します。
  (tx) => appendTransactionMessageInstructions(instructions, tx),
);

// トランザクションメッセージに設定した手数料支払い者が署名して署名付きのトランザクションメッセージを作成します。
const signedTransaction =
  await signTransactionMessageWithSigners(transactionMessage);

// このままではトランザクションの有効期限がブロックハッシュベースとして認識されず、
// トランザクション送信関数を利用するときに型定義のエラーが出てしまいます。
// 署名したトランザクションメッセージにlifetimeConstraintプロパティを追加して
// 有効期限がブロックハッシュベースのトランザクションとして扱えるようにします。
const signedTransactionWithLifetime =
  signedTransaction as typeof signedTransaction & {
    lifetimeConstraint: {
      lastValidBlockHeight: bigint;
    };
  };

// トランザクションを送信して、実行が完了したかをcommitmentの指定で確認します。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransactionWithLifetime,
  { commitment: "confirmed" },
);

// トランザクション signatureを取得します。
const transactionSignature = getSignatureFromTransaction(
  signedTransactionWithLifetime,
);

// 最後にミントアドレスとトランザクション signatureをコンソールに表示します。
console.log("Mint Address:", mint.address);
console.log("Transaction Signature:", transactionSignature);
