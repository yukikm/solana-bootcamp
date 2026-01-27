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
touch create-token-mint.ts
```

5. では実際に実装していきましょう。
