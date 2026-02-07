# 導入

次に今発行したトークンを別のアドレスに送金してみましょう。

# 作業

1. [./new-token.ts](./new-token.ts)のコメントを読んでいく。

2. 動作確認してみましょう。local validatorを起動します。

```
surfpool start
```

3. プログラムを実行してみましょう。

```
npx tsx new-token.ts
```

4. 元々送信者のアカウントに発行された1トークンが無事に0.5トークン受け取り手のアドレスに転送できていますね。

```
Mint Address: AmyVqS4BRsZxqYXdakU8MaSzF81USfYyNswnH8vRTr49

Transaction Signature: cJkz96C8PPhZm35mn9L7SxR9Zx1uqi3zWmueX9hpCzoSJ6se6Gz6jth45ATrdibmXnQ7XngsEgr8M9PDzLhgHJx

Token Account Address: 4YeJ8GgepiWEancpV6meQvLJNpYJiXx5QAWiwVNmR2T1

Transaction Signature: 9cXiicrPstJjRUS9YvPWKs8iok4iSBNv7TdWtnZoBHbesJBxwcDzFZWRmL9WviJvWHKK7yP1yUjeJW6y5cCb3Df

Associated Token Account Address: 7j2U6U87LAAWV4Q4hwPDWjBBj58hy2uQUZSWmD4qPd2h

Transaction Signature: AdM48Dx88v7p12J2L9Uvh7w8SVhDuaJ8ysPCEWtvTX2ziAMes7c8LSbKNdQwjsQNj57MxGni8Kvtf8vkhCpjv4C

Successfully minted 1.0 tokens

Transaction Signature: 2QJcwQSi7ZFH1rmW2QFxRBuaBpWQQJReJFaJ478RbHeZYy619wPLWpkgN1RZw83pYujCWTMYQz8HHJx1c7PBxnWp

Recipient Associated Token Account Address: 3Pk2ZJUvc4HZwHfuJbteNwu3fsprrj4qyz9uuiRkfT1g

Transaction Signature: 26zSjreg61RGk1J2TwF3u2azf4iC6aeTYowEBvvzqF1eBqu4pJRm5WVLDq5iiDYnNNFt6Sw4T9RsifzsBRdcaxim

Transaction Signature: 4FJzsHgLZmEB2QwHNJ3CgNGEQ7CRYGDr235KVfD7LsxNEuqa5rmbwhcpTsjFJ7FTA7DwpzPDFSpT8QELvfKNpx2o

Successfully transferred 0.5 tokens

=== Final Balances ===
Sender balance: 0.5 tokens
Recipient balance: 0.5 tokens
```
