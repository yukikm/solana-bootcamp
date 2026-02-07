# 導入

フリーズしたトークンアカウントのフリーズを解除していきたいと思います。
解除するとアカウントは再びトークンの送受信が可能になります。解除もフリーズ時と同様、ミントアカウントでフリーズ権限を持つアドレスのみがフリーズを解除できます。

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

4. 無事トークンアカウントの解除ができましたね。これで再びトークンの送受信もできるようになります。

```
Mint Address: 49M7jM8tzvnJ3nYSMGh7WbkHFeVaPE55YRNLRsDiT5PH

Transaction Signature: 2eWE73omwM8pQiv6yfy4ijV8s7tQwogimZMVb2C712XmcELXmpA1D4Y4dNrENadPWHvAhEy51VGBGyGfCzRKkyet

Token Account Address: HpQtBU3CZNm3hZdhSwsah1oX93uGVe1wHcuwcwQxLLVW

Transaction Signature: RGuAdbJiT6Y23WvrhTxWuYjHDpRDaUKUS9Qi349zPTzLnvCCm3dKbipgdCJXm4WJwDcEnec1NT67puNuE7iyj8u

Associated Token Account Address: 3tYrsFm38SDbp49rCk2Bjr1UcerM7CBicZhQ5sgoyzUD

Transaction Signature: 2f3ktKyPRTK5pD3Xctn588if8dCnvMnsntj7cvuRNcnLG4ZfFjyt5tJJCmyHBZxM635shUrHVn3S182peAqSgFjb

Successfully minted 1.0 tokens

Transaction Signature: 3KYsdtSumjUVA4NoS2h8t21h33gfDpbjHx3pA6QydSHcAeivWQnkJ88yCaEBz3PwcyTBaEuGfP7oaK5XtBzXkpPu

Recipient Associated Token Account Address: FJ8vjtuh5VVJ5bqkFKGk948H9uXY2sicdYk6TgXXU2mD

Transaction Signature: 5wKWi8ijcUj1axPrHW3TXAGSZeLqgwtP3fxqgjm5pkSJ37NcLDV8gYRPihAUD1Uw3Z7YgipqEWCVQdNMbzEek27U

Transaction Signature: 3gKzwViPP8LeNcsBAnsWp1XV8fSgUDkUB9JNFchhRufp8PzwM25SVP5i5KacaZnujZ5zt2TCwYZRNno2FQFyXLjh

Successfully transferred 0.5 tokens

=== Final Balances ===
Sender balance: 0.5 tokens
Recipient balance: 0.5 tokens

Successfully frozen the token account

Transaction Signature: 4jvhjCqniWa36BqhckdKw4Tc5BFqSERMtboRbnpYkHZh5cvh3omKnd8GTBrNZ4YdCyBS1Pf3SgA8YuHdcwmUNyCn

Successfully thawed the frozen token account

Transaction Signature: xEmFz7BdTXXN9LdTqt68y3oCS3jQGuTKHBotvF1NxutgwHCGJZszT1oV6zcZe5NzBPJZSeoE4mWByf88J8XP32L
```
