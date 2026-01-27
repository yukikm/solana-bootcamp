# 導入

ここからは作ったトークンアカウントに対して実際にトークンを発行していきます。
トークンミントアカウント作成時にMint Authorityとして定義したアカウントのみがトークンを発行できます。
発行されたトークンは先ほど作ったトークンアカウントで受け取ることができます。
実際にトークンを発行するプログラムを書いていきましょう。

# 作業

1. \*./new-token.tsのコメントを読んでいく。

2. 動作確認してみましょう。local validatorを起動します。

```
surfpool start
```

3. プログラムを実行してみましょう。

```
npx tsx new-token.ts
```

4. 無事にトークンが発行できましたね。

```
Mint Address: GpeQDAkgTjQvqLmuV6n6ZTRiMR78Aioq3TwPQgxdHDj

Transaction Signature: 43nCBydhfpTUaKFoXXQwCNBh4Be3wDRQkD5YgrTvi1Tw7rcqBYxMAiW9WX1UTpJXRAhSLqFABe8MRXt5kAMPhCaT

Token Account Address: 3zf2uXB3uuGsitubwoekEVBJqAUgYde26Rx3cRVC5ttS

Transaction Signature: 3kUGzwybGcXEeAdqfy6431F3GqF5dh8CerDkiZQqSuZP5svnWTvgmXGpa277DML8q9tTmCfqqPiMPsKGZNjV76md

Associated Token Account Address: 6HZArbemfyfMftK6Wqg6u3zZzTfvtiUoNhD6tPXnkA4x

Transaction Signature: 63h7hEML3JaTzMKaEDjJQ7yQDS1ntJgVsnywVdSnhDzwKKKiY6jrPpBhupveugvYCWVhiHxkaZfhezobwusmPLq5
Successfully minted 1.0 tokens

Transaction Signature: 5Wh6XKk2kFqzipNr4TiNzCM3oP2RVakbiZC1BPkAKYtB5r1Faj3jDDfqhvNRR814aQjc84bVmwKnGqnx6cjkJdvc
```
