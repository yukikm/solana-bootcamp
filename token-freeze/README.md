# 導入

次にトークンアカウントのフリーズということを実施してみたいと思います。
フリーズするとそのトークンアカウントからトークンを転送したり、トークンを破棄するといったことができなくなります。
トークンミントアカウントを作成する時にフリーズできる権限を持たせるアドレスを指定することができ、そこで指定したアドレスのみがトークンアカウントをフリーズすることができます。ここで指定されないとトークンフリーズはできません。

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

4. フリーズできましたね。

```
Mint Address: CnVYuSRjhBWSvLsxH9EnWVLGUP22Pa64kyrZi4yowqpw

Transaction Signature: 2o6THdTeUnjX7Jc4bFQvP2ToYmQEhxGEY7HEaxw5nBcVioQBfJwgqXBtsLys3DiVzQK5YPkzNmwai3AqYLsuHtMQ

Token Account Address: 8i235CsjDXgi9wfniqG68VcvWzTt99b33gQNNt3q6XhC

Transaction Signature: PbSvnM2LqBkk6Ja5UczcxKn9m9qKZQ5jYq2WeNMFWb2agAqvwZZFpbg3fCrMY2ZbGsJyujwHEohwdonJ7WtH1vt

Associated Token Account Address: BmDyKobftpajJB8GGSnnnrZWuAcyEC9SHEYUNQMQrBHa

Transaction Signature: 4op39YANbnoDYnHwhDdKzovnersBS3HaweAHar8cMT2BG7aDDhaqrxuizs6RL2RnUWy4JJoLykZt1LMqiYUd9a4U

Successfully minted 1.0 tokens

Transaction Signature: 4zZ27VYNeCCP6tG7v6GCDJftmB1kxj2te9ax1fZiGdi6fBQAksLrBPPYBgKiYuEPPjeKKkhwHukcZodZ2QYcJQwS

Recipient Associated Token Account Address: AJbFRU4ngtu6jD1e4855J6wmZ8kfCaS8wSzPnWYEGSxK

Transaction Signature: v2PvhP6ScmGVtwhMegypeNuCDfUn5AaTpRxeuhGiJYGc4qRYzmvxZQYHm4XsUJwQ15LBwoCQ8VZT2jFLfJqk4dU

Transaction Signature: 21XT9UTqXkHEo2sNWLbdQmzcxZDSiHNkMApTD4Z5fbNVnW8115dKuNDscy2UEBoJu8pdsE5hMpq9Pg1MU1gxjG5j

Successfully transferred 0.5 tokens

=== Final Balances ===
Sender balance: 0.5 tokens
Recipient balance: 0.5 tokens

Successfully frozen the token account

Transaction Signature: kpvFvmoWtKFXwi5TRu76432wWjxZta6EenmtREMkVgstWH45Jdeo4xLJur7rGEtQqfXnXZKGStdYoxuv18cQbGk
```
