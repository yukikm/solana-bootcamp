# 導入

次にトークンアカウントを作成していきましょう。
トークンアカウントでは特定のトークンの残高を保持するアカウントです。
各トークンアカウントは一つのミントアカウントに関連づけられていて、トークンの残高などを確認できます。

# 作業

1. 先ほどのトークンミントアカウントのコードに追記する形でトークンアカウントを作成して、ミントアカウントに関連づけていきましょう。

2. \*./create-token-account.tsのコメントを読んでいく。

3. local validatorを起動します。

```
surfpool start
```

10. プログラムを実行してみましょう。

```
npx tsx create-token-mint.ts
```

11. 無事Mint Addressとトランザクションシグネチャが表示されましたね。

```
Mint Address: 3VD21KzNmU3vkikLNFTaKu8XyMKZTR924yygSkJp6baV

Transaction Signature: 1ZEHVK89mGNBquaQf47iyaGgAhhzUNUfhNfQ2A5Y9LQmsVdg7T7SJrCxFZgC3RkDxCHoBVFwDfEWUsJPs51rMxa
```
