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

  // generateKeyPairSignerは 新しい公開鍵/秘密鍵ペアを生成しする関数です。今回はテスト用のアカウントを作成するために使用します。
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

// Create Connection, local validator in this example
const rpc = createSolanaRpc("http://localhost:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://localhost:8900");

// Generate keypairs for fee payer
const feePayer = await generateKeyPairSigner();

// Fund fee payer
await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: feePayer.address,
  lamports: lamports(1_000_000_000n),
  commitment: "confirmed",
});

// Generate keypair to use as address of mint
const mint = await generateKeyPairSigner();

// Get default mint account size (in bytes), no extensions enabled
const space = BigInt(getMintSize());

// Get minimum balance for rent exemption
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

// Instruction to create new account for mint (token program)
// Invokes the system program
const createAccountInstruction = getCreateAccountInstruction({
  payer: feePayer,
  newAccount: mint,
  lamports: rent,
  space,
  programAddress: TOKEN_PROGRAM_ADDRESS,
});

// Instruction to initialize mint account data
// Invokes the token program
const initializeMintInstruction = getInitializeMintInstruction({
  mint: mint.address,
  decimals: 9,
  mintAuthority: feePayer.address,
});

const instructions = [createAccountInstruction, initializeMintInstruction];

// Get latest blockhash to include in transaction
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// Create transaction message
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }), // Create transaction message
  (tx) => setTransactionMessageFeePayerSigner(feePayer, tx), // Set fee payer
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx), // Set transaction blockhash
  (tx) => appendTransactionMessageInstructions(instructions, tx), // Append instructions
);

// Sign transaction message with required signers (fee payer and mint keypair)
const signedTransaction =
  await signTransactionMessageWithSigners(transactionMessage);

// Send and confirm transaction
await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransaction,
  { commitment: "confirmed" },
);

// Get transaction signature
const transactionSignature = getSignatureFromTransaction(signedTransaction);

console.log("Mint Address:", mint.address);
console.log("\nTransaction Signature:", transactionSignature);
