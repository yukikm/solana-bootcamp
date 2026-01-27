# 導入

次にトークンアカウントを作成していきましょう。
トークンアカウントでは特定のトークンの残高を保持するアカウントです。トークンの総残高などを管理します。
各トークンアカウントは一つのミントアカウントに関連づけられていて、トークンの残高などを確認できます。

# 作業

1. 先ほどのトークンミントアカウントのコードに追記する形でトークンアカウントを作成して、ミントアカウントに関連づけていきましょう。

2. \*./new-token.tsのコメントを読んでいく。

3. 動作確認してみましょう。local validatorを起動します。

```
surfpool start
```

4. プログラムを実行してみましょう。

```
npx tsx new-token.ts
```

5. 無事新しくトークンアカウントとそのトランザクションシグネチャが表示されましたね。

```
Mint Address: 3PrepAod4JZWz9hbe7P7EbAFL4LDy1CYbuYnMgTHdUwM

Transaction Signature: ZJTQ7sUb62simF4pLVDDKUFCpj6BZ7aZwpDrf3dL9UN15vf8PsM3jUC4CtS6rGUVnnPAx9f3f87JdwxtfBdNZHR

Token Account Address: FyAaVbET11erv2WiHQUckHizGEALgd7nP9bUTD3ArFxe

Transaction Signature: 2GTQrETd1khvVE82H44kGdBrq811BhEchfSMcEFU5F6wA9ppA2YHxfhqcSaLVvbXfydFZKeD99kjAK5e21FsZLE5
```

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
