# 導入

次にアソシエイテッドトークンアカウントを作成していきましょう。
アソシエイテッドトークンアカウントは各ユーザのウォレットが特定のトークンを保持するためのトークンアカウントです。
ウォレットアドレスとトークンミントアドレスから生成されたシードを元に作られたプログラム派生アドレス、PDAです。
では実際に作っていきましょう。

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

4. 無事にAssociated Token Account のトランザクションシグネチャが表示されましたね。

```
Mint Address: 9pRbYUTWvmf4UjWAhrhXnRHMAMMrWV6UUcaUFz5aaoSE

Transaction Signature: 3gZN8swE62dz7WCPNnaNqufgE3AUkwMRJdcU8raiBuxTaQVMgmUQEoSf8NQcLZHdsKyS7Xpg6mVAShkcTLmui8YU

Token Account Address: DH4LKHomt2rpJYiwjE8bawqcLchtyoJuVWu1B7X8VFoD

Transaction Signature: 2PMG5ccZGBih6EeLDgYYNhmxNBq7w3F9ZdYgt9NTuu6DAg2pN8sWXbefoHC7VEpyVvF54RmDzT4B1aLpdEAqNiEf

Associated Token Account Address: FpoGQHT9S5h2uWcVs5jC8XrhfZwM3Mw7iFg2YaCNvaBh

Transaction Signature: 2a7j6kfmSBpqPUvGtP2AMtDTHXTFdZLjHnWgSArf7nJ6kpbBM6pQkvPQjgDFYG27SLT6FELoVLc4gndVuRYQZxa3
```
