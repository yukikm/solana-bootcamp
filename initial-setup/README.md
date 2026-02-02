# 最初の導入
今からローカル環境で開発構築していきます。
Solanaの開発に必要なツールをすべてインストールできるコマンドがありまして、Macの方はそのコマンドを実行すると開発を始められます。Windowsの方はWSL環境で開発をする必要がありましてまずはWSLのセットアップを進めていきます。WSLのセットアップが終わったらMacの方と同様に開発で必要なツールすべてをインストールできるコマンドを実行すれば完了です。
今回はWindows環境でWSLのセットアップから進めていきましょう。Macの方はWSLセットアップ手順の部分はスキップしていただいて大丈夫です。

# WSLセットアップ
1. まずはWindows PowerShellを起動します。起動するときに「管理者として実行する」を選択して管理者モードで起動します。
2. アカウント制御に関する表示がでるので「はい」をクリックします。
3. PowerShellが起動できたら`wsl --install`コマンドを実行します。
4. 無事インストールが完了しました。一度コンピュータを再起動しましょう。
```
PS C:\Windows\system32> wsl --install
Windows オプション コンポーネントをインストールしています: VirtualMachinePlatform

展開イメージのサービスと管理ツール
バージョン: 10.0.26100.5074

イメージのバージョン: 10.0.26200.7623

機能を有効にしています
[==========================100.0%==========================]
操作は正常に完了しました。
要求された操作は正常に終了しました。変更を有効にするには、システムを再起動する必要があります。
```
5. 再起動ができたら再度Windows PowerShellを起動します。
6. `wsl --list --online`コマンドでインストールできるLinuxディストリビューションを確認してみます。
7. 今回は一番上にあるUbuntuをインストールします。
8. `wsl --install -d Ubuntu`コマンドでインストールしていきます。数分待ちます。
9. インストールできました。初期ユーザをセットアップします。まずはユーザ名です。私は`yuki`といれます。
10. 初期ユーザのパスワードを入力します。`kim-nnyk5678`任意のパスワードを入れましょう。
11. 再度聞かれるのでもう一度入力します。
12. 無事セットアップできました。
```
PS C:\Windows\system32> wsl --install -d Ubuntu
ダウンロードしています: Ubuntu
インストールしています: Ubuntu
ディストリビューションが正常にインストールされました。'wsl.exe -d Ubuntu' を使用して起動できます
Ubuntu を起動しています...
Provisioning the new WSL instance Ubuntu
This might take a while...
Create a default Unix user account: yuki
New password:
Retype new password:
passwd: password updated successfully
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

yuki@Windows:/mnt/c/Windows/system32$
```
13. 検索バーからも「Ubuntu」と検索することでUbuntuターミナルを開くことができます。

# WSL Visual Studio Codeでの確認
1. VS Codeを利用している場合はWSLの拡張機能をインストールすると一緒に利用ができます。
2. 拡張機能から「WSL」と入力してみましょう。
3. Microsoft公式の拡張機能をインストールします。
4. VS Codeの左のメニューの「Remote Explorer」をクリックすると、さきほどインストールしたUbuntuが表示されます。
5. Ubuntuをクリックすると新しいVSCodeエディタが立ち上がります。左下に「WSL:Ubuntu」と書かれていますね。これでVSCodeでもUbuntu環境が利用できます。
6. terminalを開いてみましょう。先ほどセットアップしたユーザでLinuxコマンドを実行することができますね。


# Solana依存関係インストール
1. では実際に必要なツールをインストールしてみましょう。ここからはWindows・Mac共通です。Windowsの方はWSLのUbuntu環境を、Macの方はターミナルを開いてください。
2. 公式ドキュメントにインストールコマンドが掲載されているので確認してみます。（公式ドキュメント`https://solana.com/ja/docs/intro/installation`を開く）
3. `curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash` こちらがインストールコマンドになります。こちらのcurlコマンドをコピーして実行します。
4. 管理者権限がインストール時に必要なため、sudo権限を利用するパスワードを入力します。私は先ほどUbuntuをインストールしたときに設定したパスワードを入力します。
5. 数分時間がかかるので少し待ちます。
6. インストールが完了しました。必要なツールは大方インストールできましたが、Surfpoolだけ'Not installed'ですね。
```
+-----------------+
→ Run surfpool start to get started
→ Further documentation: https://docs.surfpool.run
[ERROR] Surfpool installation failed.
[ERROR] Failed to install Surfpool.

Installed Versions:
Rust: rustc 1.93.0 (254b59607 2026-01-19)
Solana CLI: solana-cli 3.0.13 (src:90098d26; feat:3604001754, client:Agave)
Anchor CLI: anchor-cli 0.32.1
Surfpool CLI: Not installed
Node.js: v24.10.0
Yarn: 1.22.22

Installation complete. Please restart your terminal to apply all changes.
```
7. これはパスが通っていないことによるものなので、一度ターミナルを再起動してみます。
8. バージョン確認コマンドを実行します。
`rustc --version && solana --version && anchor --version && surfpool --version && node --version && yarn --version`
9. 無事すべてのバージョンが表示されました。
```
yuki@Windows:~$ rustc --version && solana --version && anchor --version && surfpool --version && node --version && yarn --version
]rustc 1.93.0 (254b59607 2026-01-19)
solana-cli 3.0.13 (src:90098d26; feat:3604001754, client:Agave)
anchor-cli 0.32.1
surfpool 1.0.0
v24.10.0
1.22.22
``` 
10. SolanaではRustを使って開発を進めるのでrustのコンパイラであるrustcをインストールします。またRustで実装したOnchain上のプログラムとのやり取りやDappsのフロントエンド、トークンの発行などがJavascriptやTypeScriptで実装できるのでNodeとYarnもインストールします。solana cliはテスト用ウォレットの作成やテストで利用するSOLの発行などができます。anchor cliはSolanaのプログラムを実装する際の開発フレームワークで開発したプログラムをテストやDevnet、MainnetBetaにデプロイすることができます。

# クロージング
以上でローカル開発環境の構築は終了です。次は実際にプログラムを書いてみましょう。

# 参考
https://solana.com/ja/docs/intro/installation
https://learn.microsoft.com/ja-jp/windows/wsl/install