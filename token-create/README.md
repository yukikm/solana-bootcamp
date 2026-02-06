# 最初の導入

ここからはSolanaのトークンについてお話しします。そして実際にトークンを作りましょう。
今のところ私たちがお話しした唯一のトークンはSOLで、SOLはCounterプログラムを作成した時にオンチェーンプログラムを動作させるために必要でしたね。
SOLはSolanaのネイティブトークンであり、Solana自体に組み込まれています。
ただし、実世界でブロックチェーンを利用する場合、SOL以外の多くのトークンを使用することになるでしょう。Solanaでは、これらをSPLトークンと呼びます。

名前について気になる方もいると思いますが、SPLはSolana Program Libraryの略称です。 これは、トークンを作成、転送など、トークンに関する一連のプログラムのことです。

こちらのコースの残りの部分では、SPLトークンを単にトークンと呼ぶことにします。トークンはブロックチェーン上で様々なものを表現するために使用されます。
USDCのようなステーブルコイン、NFT、株式や金属のような実世界の資産をブロックチェーン上で表現するためのトークンなど様々なトークンが存在します。

トークンはトークンミントアカウントによって発行されます。ブロックチェーンの世界ではトークンを発行することをミントと呼びます。そして、トークンミントアカウントは大量のトークンを作るための工場のようなものです。

工場の例で例えると、この工場ではMint Authorityと呼ばれるトークンを発行する権限を持った人によって運営されています。Mint Authorityは大量のトークンを発行する全ての取引に署名をする必要があります。

Solana上のトークンはそれぞれこの独自のミントアカウントを持っています。 例えばステーブルコインのUSDCはCircleという会社によって作られており、彼らのウェブサイトにはトークンのミントアドレスが公開されています。
Circle社はUSDCの発行権を持つMint Authorityということができます。

トークンプログラムを使って私たち自身のトークンミントアカウントを作成するには、私たち自身をMint Authorityとして設定します。
Mint Authorityは任意のアドレスを設定することができて、そのアドレスを使って新しいSPLトークンを作成することができます。このアドレスはもちろん自分達が所持しているアドレスでも作成可能です。

また、私たちが所持している各アカウントがトークンを受け取ると、このトークンを保存する箱が必要になります。通常のアカウントはネイティブトークンのSOLのみが保存できます。そのためAssociated Token AccountというSPLトークンを保存するためのアカウントが作成されます。Associated Token Accountはウォレットアドレスとトークンミントアドレスから生成されたシードを元に作られた単なるPDAです。例えばアリスのウォレットアドレスとUSDCのミントアドレスを元にPDAを算出すればアリスのUSDCのAssociated Token Accountを見つけることができます。

それでは実際にトークンを作ってみましょう。

# トークンミント作成

[./create-token-mint/README.md](./create-token-mint/README.md)に台本作成。

# トークンアカウント作成

[./create-token-account/README.md](./create-token-account/README.md)に台本作成。

# Associated Token Account作成

[./create-associated-token-account/README.md](./create-associated-token-account/README.md)に台本作成。

# トークンをAssociated Token Accountにミント

[./token-mint/README.md](./token-mint/README.md)に台本作成。

# トークン転送

[./token-transfer/README.md](./token-transfer/README.md)に台本作成。

# トークンフリーズ

[./token-freeze/README.md](./token-freeze/README.md)に台本作成。

# トークン解凍

[./token-thaw/README.md](./token-thaw/README.md)に台本作成。

# トークンバーン

[./token-burn/README.md](./token-burn/README.md)に台本作成。

# トークンアカウントクローズ

[./token-account-close/README.md](./token-account-close/README.md)に台本作成。

# 最後

以上でトークンの作成に関するハンズオンは終了します。
次はトークンエクステンションに関するハンズオンになります。
お疲れ様でした
