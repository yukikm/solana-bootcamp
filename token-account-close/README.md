# 導入

最後にトークンアカウントをクローズしていきましょう。
クローズするとアカウント作成時に必要だったレントフィーのSOLは指定されたアカウントに転送されます。
また、クローズする前に、トークンアカウントの残高はゼロにする必要があります。今回は先ほどburnして0になったトークンアカウントをクローズしていきます。
このクローズの操作はトークンアカウントの所有者または指定されたクローズ権限者のみが実行できます。

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

4. 無事にトークンアカウントがクローズされましたね。

```
Mint Address: GV9nTaLAdTMd1ubyjR8dpcYCp3d3xScbyeGeGj48HLb9

Transaction Signature: 51DEcLUqTRyuLwM2qRYK7zM5VFmKWVxKe7PF2DpRsmdpTR9mVt3AvKNBZzYLB5ERasP7U7hX1CkxzkQcXVA7HgvD

Token Account Address: 91vByDYtEm1Gv4J93nKTU39ByG1obKsee7fHwyYUEvn8

Transaction Signature: 5WkDGZ3qPVW7sCBEtTeBdnb7NuzLWyAinLLLjBbysL4LAAhfk53TNHX1WUm7CSrNwyRVJ5QLutGLr7Bh7wadgcjd

Associated Token Account Address: 4Ft9gQhCKWLG8QRATB2CaBjs3SsaezVNAKgxJDq1BsmU

Transaction Signature: 5v2SuHZyczEsYEewtbrcMFNmR6GJWhVF7jXvUW5v2N3pcvEfKkFC5BAgAk8zuAWNyf1AV2U2jA6GHEJKCb7SyVEN

Successfully minted 1.0 tokens

Transaction Signature: 25eHyfJy4UA99K686CpsP1drKmCLo29kwpBFZrLHfcNGYRAHEjfefPFibr9JESzsfqFKzo6BpyXR6FGYAZoDieVJ

Recipient Associated Token Account Address: 8PtubaNuz9RJZigpisRcpsC6JhBSrHneujTiZMhRNnPZ

Transaction Signature: Kfxdn4WiwsN7vdGuac1rnwXvBTdtRPUhrmNwL1HK2fmFHnU4qDBwiyiH1h7pC9DwSjKRYicd4Gbjwvncbqr1Xtx

Transaction Signature: 2Gn5ZceCDmT3Ept2k8mFh44ELR5f9riVuX6SSEtsPHpTnW4eBdj5ZEb7cFoa47x5jLey1oxrcg1KyLfEdatwQhB6

Successfully transferred 0.5 tokens

=== Final Balances ===
Sender balance: 0.5 tokens
Recipient balance: 0.5 tokens

Successfully frozen the token account

Transaction Signature: 63o26X7wGSHefwYyt6xaczX3CanarvSBH7W1GfSKNS4Kd9SxYMnvoJR5z7BDVLmPP7RmNVAVdT96pjjvurCU8H4q

Successfully thawed the frozen token account

Transaction Signature: 5VdagJ1DtaCKyj7hqqeXCmFDfddMMfATo8KRhEAUGV5UFz9CEMZpVpMexNgvcdvarcG5jsMnyTTxaq31RZfxGx8s

Token balance before burn: 0.5 tokens

Token balance after burn: 0 tokens

Successfully burned 0.5 tokens

Transaction Signature: 2qWeVp9FLLpdL2qBQiBRizv5qu2YYg5dazmcCB4MnLnbA12Q4TfCKGBG8GmGEENWmFAb4Ygs1sNJedPseMcDCWh9

Successfully closed the token account

Transaction Signature: w9WSrKxm1MaM71dLGHr2Uwdw1M4QbQBiqFyNTSBNrbwmzZE4xEysCnkF1tE9yYwRws5H7BFqhxFTGGwRw7Mr4Zn
```
