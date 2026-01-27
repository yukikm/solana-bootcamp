// まずは必要なパッケージを@solana/kitからインポートしていきます。
import {
  // airdropFactoryはテスト用のSOLを取得するために使用します。
  airdropFactory,
  // appendTransactionMessageInstructionsはトランザクションに何をするのか命令を追加する関数です。今回はミントアカウントの作成をするための命令を追加します。
  appendTransactionMessageInstructions,
  // createSolanaRpcは Solana RPC クライアントを作成する関数で指定したRPCエンドポイントに接続します。
  createSolanaRpc,
  // createSolanaRpcSubscriptionsはSolanaノードとWebSocket接続を確立し、リアルタイムでのデータの送受信を可能にします。
  createSolanaRpcSubscriptions,
  // createTransactionMessageはトランザクションの基本構造を作成する関数です。この関数を使って必要な命令も含めてトランザクションの構造を作ります。
  createTransactionMessage,
  // generateKeyPairSignerは 新しい公開鍵/秘密鍵ペアを生成しする関数です。今回はトークン作成者となるテスト用のアカウントとトークンミントアカウントを作成するために使用します。
  generateKeyPairSigner,
  // getSignatureFromTransactionは 署名済みトランザクションからTransaction Signatureを取得する関数です。最後にミントアドレス作成後のトランザクション署名を表示するために使用します。
  getSignatureFromTransaction,
  // lamportsはSOLの最小単位であるlamportを適切に扱うための関数です。今回はテスト用のSOLを取得する時に取得したい量をlamports単位で指定するために使用します。
  lamports,
  // pipeはトランザクションメッセージを作成する時に利用します。命令を複数含む複雑なトランザクションメッセージを作る時により読みやすいコードを書くことができます。
  pipe,
  // sendAndConfirmTransactionFactoryは実際にトランザクションを送信し、トランザクションが作成されるまで確認を待ちます。
  sendAndConfirmTransactionFactory,
  // setTransactionMessageFeePayerSignerはトランザクションメッセージを作る時に手数料を支払うアカウントを設定する関数です。
  setTransactionMessageFeePayerSigner,
  // setTransactionMessageLifetimeUsingBlockhashは 最新のブロックハッシュを使ってトランザクションの有効期限を設定します。
  setTransactionMessageLifetimeUsingBlockhash,
  // signTransactionMessageWithSigners: トランザクションメッセージに署名する関数です。
  signTransactionMessageWithSigners,
} from "@solana/kit";

// @solana-program/systemからも必要なパッケージをインポートします。
import {
  // getCreateAccountInstructionは新しいアカウントを作る関数で、今回はgetCreateAccountInstructionを使ってトークンミントアカウントを作成する命令を生成します。
  getCreateAccountInstruction,
} from "@solana-program/system";

// @solana-program/tokenからも必要なパッケージをインポートします。
import {
  // getInitializeMintInstructionはトークンMintアカウントを作る時に初期化する命令を生成するために利用します。
  getInitializeMintInstruction,
  // アカウントを作る時にはアカウントに必要なデータ量も指定するので、getMintSizeは Mintアカウント生成時に必要なバイト数を返す関数です。
  getMintSize,
  // TOKEN_PROGRAM_ADDRESSは Token Program のアドレスです。
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

// RPC接続クライアントを作成します。今回はローカルバリデータに接続します。
const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

// トークンミントアカウント作成時の手数料を支払うアカウントのキーペアを生成します。
const feePayer = await generateKeyPairSigner();

// 手数料支払い用アカウントのアドレスにSOLをエアドロップします。
await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: feePayer.address,
  lamports: lamports(1_000_000_000n),
  commitment: "confirmed",
});

// ミントアドレスとして使用するキーペアを生成します。
const mint = await generateKeyPairSigner();

// デフォルトのミントアカウントサイズ（バイト単位）を取得します。
const space = BigInt(getMintSize());

// ミントアカウントを作成する時にレントフィーの支払いが免除されるために必要な最小額を取得します。
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

// トークンミントアカウントを新しく作成する命令です。
const createAccountInstruction = getCreateAccountInstruction({
  // payerはアカウント作成時の手数料を支払うアカウントです。
  payer: feePayer,
  // newAccountは新しく作成するアカウントです。今回は先ほどキーペアを作ったミントアドレスを指定します。
  newAccount: mint,
  // lamportsはアカウントに送るSOLの量です。先ほど取得したレントフィー免除に必要な最小額を指定します。
  lamports: rent,
  // spaceはアカウントに割り当てるデータ量です。先ほど取得したミントアカウントサイズを指定します。
  space,
  // programAddressはアカウントを管理するプログラムのアドレスです。インポートしたトークンプログラムを指定して所有権を渡します。
  programAddress: TOKEN_PROGRAM_ADDRESS,
});

// トークンミントアカウントを作成後に初期化する命令です。
const initializeMintInstruction = getInitializeMintInstruction({
  // mintは初期化するミントアカウントのアドレスです。
  mint: mint.address,
  // 10進数で表したトークンの小数点以下の桁数です。今回は9桁に設定します。
  decimals: 9,
  //  mintAuthorityは新しく作成するトークンの発行権限を持つアドレスです。今回は手数料支払い者と同じアカウントに発行権限を与えます。
  mintAuthority: feePayer.address,
});

// トークンミントアカウントを作成する命令と初期化する命令を配列にまとめます。
const instructions = [createAccountInstruction, initializeMintInstruction];

// トランザクションに含める最新のブロックハッシュを取得します。
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// トランザクションに送るメッセージを作成します。
// pipe関数を使ってトランザクションメッセージを作成していきます。
const transactionMessage = pipe(
  // createTransactionMessage関数を使ってトランザクションメッセージの作成を始めます。
  createTransactionMessage({ version: 0 }),
  // 手数料支払い者を設定します。ここで設定したアカウントがトランザクションに署名します。
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
  // 次にトランザクションのブロックハッシュを設定します。
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  // それからトークンミントアカウント作成、初期化の命令を追加します。
  (tx) => appendTransactionMessageInstructions(instructions, tx),
);

// トランザクションメッセージに設定した手数料支払い者が署名して署名付きのトランザクションメッセージを作成します。
const signedTransaction =
  await signTransactionMessageWithSigners(transactionMessage);

// トランザクションを送信し、確認を待ちます。
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransaction,
  { commitment: "confirmed" },
);

// トランザクション署名を取得します。
const transactionSignature = getSignatureFromTransaction(signedTransaction);

// 最後にミントアドレスとトランザクション署名をコンソールに表示します。
console.log("Mint Address:", mint.address);
console.log("\nTransaction Signature:", transactionSignature);
