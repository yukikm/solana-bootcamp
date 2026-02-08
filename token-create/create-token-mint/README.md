# 導入

まずはトークンを発行するために必要なトークンミントアカウントを作成していきます。

# 作業

1. 作業ディレクトリを作ります。

```
mkdir new-token
cd new-token
```

2. nodejsの初期プロジェクトを作成します。

```
npm init -y
```

3. 必要なパッケージをインストールしましょう。今回は@solana/kit、@solana-program/system、@solana-program/token-2022の３つのパッケージをインストールしていきます。@solana/kitはNodeやWeb、React Nativeなどの環境でSolanaアプリを構築するためのSDKです。JavaScriptでSolanaのオンチェーンとやり取りするために利用します。@solana-program/system はSolana上で新しいアカウントを作るときに利用します。今回はトークンミントアカウントです。@solana-program/token-2022はトークンを発行したり転送したりとったトークンに関するモジュールを備えたライブラリです。以前は@solana-program/tokenといったライブラリを使ってSPLトークンを作っていました。このライブラリではトークンの送受信などシンプルな機能のトークンを作ることができるのですが、KYCやプライバシーへの配慮などトークンに求められることが昨今増えてきたことで、Token2022というトークンに拡張機能を組み込める機能が実装されました。

```
npm i @solana/kit @solana-program/system @solana-program/token-2022
```

4. 実装するファイルを作成します。

```
touch new-token.ts
```

5. ではVisual Studio Codeを開いて実際に実装していきましょう。

6. [./new-token.ts](./new-token.ts)のコメントを読んでいく。

7. 動作確認をしていきます。typescriptのまま動作確認しようと思うので、今回はtsxといったパッケージをインストールします。

```
npm i -D tsx
```

8. package.jsonを確認します。今回awaitをトップレベルで使っているので、typeがcommonjsのままでは動作しないため、moduleに書き換えます。

```
...
"type": "commonjs",
...
```

```
"type": "module",
```

9. local validatorを起動してローカル環境内で動作確認します。環境構築のパートでもインストールしたsurfpoolというツールでローカル環境の中にオンチェーンを再現してテストできます。

```
surfpool start
```

10. プログラムを実行してみましょう。

```
npx tsx new-token.ts
```

11. 無事Mint Addressとトランザクションシグネチャが表示されましたね。トークンミントアカウントが完成しました。

```
Mint Address: 3VD21KzNmU3vkikLNFTaKu8XyMKZTR924yygSkJp6baV

Transaction Signature: 1ZEHVK89mGNBquaQf47iyaGgAhhzUNUfhNfQ2A5Y9LQmsVdg7T7SJrCxFZgC3RkDxCHoBVFwDfEWUsJPs51rMxa
```
