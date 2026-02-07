# 導入

ここからはトークンアカウントのトークンを破棄していきましょう。トークンを破棄することをバーンと呼びます。トークンアカウントの所有者のみが、自分のアカウントからトークンをバーンできます。
それでは実際に実装していきましょう。

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

4. 無事に最初保持していた0.5トークンが0になりましたね。

```
Mint Address: P4MoLu971fntyn6MzddchUbjzhFBjCpMdpFRm3ooEAQ

Transaction Signature: 3v2ncJfFPcMR1QwUCum4rT9hs1oUUnhdMm8ibW7Um3tM5gqdui5MLr76SunRvRgbairoSUdJxsfMwLQf2j6Y8C6k

Token Account Address: CMLZiJJJkvyhwfwfzCg7GrKUULhGE7xt36Xjgyz2wjEM

Transaction Signature: 49ouwypKQR2AzXQCCHURHHtv8cpGGQxbeEtV1Z7BJnEFrnD1SGjLivgZtW1GE5aUPrtZ4vxtKWCD5n5v5eYR397T

Associated Token Account Address: 7fHQG3yqBDucdJiBLxh5xDnrzYSpgTzeYAPmSTe5YKJR

Transaction Signature: Bd8VrdhHnsLXuobe3GeN8GvvkEhdCti2U4Uby21gee9f6eU9psKRvcjbFTHZw4cXXk4ZxW3mj3wSYpsmCKtWgX4

Successfully minted 1.0 tokens

Transaction Signature: 341nAeD3PMGNTn6mCxru2RZ47p87pep7JWUSnkNdohTNrHDyFofqdzDmE8YGMcuDBZ6i5CgGR2YvXZsTxvbaqaNN

Recipient Associated Token Account Address: 3MS9n9i7a7jGceotf48Q6EcVdgMcCv99iMN3dB4yHFJ9

Transaction Signature: 4b238oW8F38x4Kp3gtbNtnUWLN2MxEvuXjGMZKoJDNGQsR8S4GHPnEZ5V6JTfLqAxp3H2pzmGgAE9HkcGUWnGsLe

Transaction Signature: 4UG1wdf6mwTmN8waw63E9w6km6FeDd3uByNgW4mQRCirFgBEHoox4iiVeFGmf4KWiGoqLPtENSwBQ7nQ6BBFui19

Successfully transferred 0.5 tokens

=== Final Balances ===
Sender balance: 0.5 tokens
Recipient balance: 0.5 tokens

Successfully frozen the token account

Transaction Signature: 4aea6UyHmzK3WwqdPxupQUCU6CxroZEGshyzyw22MPgKbqK4EuvxBoyRftcfbvCnNyuzABNkqwn4jN5jVq3Y7RCG

Successfully thawed the frozen token account

Transaction Signature: MKVgpjUjB65w9BGmqKZ2ddi6FeJ8FBJEscMAVesXByfVzMZWFg5yCVxu3AvUWAaybxb6UoZC1t1oaHR5zfgAkYP

Token balance before burn: 0.5 tokens

Token balance after burn: 0 tokens

Successfully burned 0.5 tokens

Transaction Signature: 3PC6u9GDt6YaeZ4XT4EEmSdNMCaqdrTKXSQcd6LKWyUNnN3tcfCTyMN1uFGRXZCcAW43grSerXXFr79SzEv43QZn
```
