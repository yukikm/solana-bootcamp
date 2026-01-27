# 導入

まずはトークンを発行するために必要なトークンミントアカウントを作成していきます。

# 作業

1. 作業ディレクトリを作ります。

```
mkdir new-token
```

2. nodejsの初期プロジェクトを作成します。

```
npm init -y
```

3. 必要なパッケージをインストールしましょう。@solana/kitはNodeやWeb、React Nativeなどの環境でSolanaアプリを構築するためのSDKです。JavaScriptでSolanaとやり取りするために利用します。@solana-program/system はSolana上で新しいアカウントを作るときに利用します。今回はトークンミントアカウントです。@solana-program/tokenはSPLトークンを作る時に利用するパッケージです。

```
npm i @solana/kit @solana-program/system @solana-program/token
```

4. 実装するファイルを作成します。

```
touch new-token.ts
```

5. では実際に実装していきましょう。

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

9. local validatorを起動します。

```
surfpool start
```

10. プログラムを実行してみましょう。

```
npx tsx new-token.ts
```

11. 無事Mint Addressとトランザクションシグネチャが表示されましたね。

```
Mint Address: 3VD21KzNmU3vkikLNFTaKu8XyMKZTR924yygSkJp6baV

Transaction Signature: 1ZEHVK89mGNBquaQf47iyaGgAhhzUNUfhNfQ2A5Y9LQmsVdg7T7SJrCxFZgC3RkDxCHoBVFwDfEWUsJPs51rMxa
```
