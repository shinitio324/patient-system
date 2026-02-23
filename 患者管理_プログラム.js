# 患者管理システム - 修正手順

## 🐛 現在の問題

Vercelで患者管理システムがバグっています：
- 画面に不要な数字が表示される
- ログインができない
- JavaScriptファイルが正しく読み込まれていない

## ✅ 解決方法

### 方法1：患者管理_プログラム.js を追加（推奨）

1. GitHubリポジトリを開く：
   https://github.com/shiniti0324/patient-system

2. 「Add file」→「Create new file」をクリック

3. ファイル名：`患者管理_プログラム.js` と入力

4. このチャットで `app.js` の内容をコピー

5. GitHubに貼り付けて「Commit new file」をクリック

### 方法2：患者管理_メイン.html を修正

1. GitHubで `患者管理_メイン.html` を開く

2. 編集ボタン（鉛筆アイコン）をクリック

3. 最後の方にある以下の行を探す：
   ```html
   <script src="患者管理_プログラム.js"></script>
   ```

4. これを以下に変更：
   ```html
   <script src="app.js"></script>
   ```

5. 「Commit changes」をクリック

## 📱 確認URL

修正後、数分待ってから以下にアクセス：
```
https://patient-system-kappa.vercel.app/患者管理_メイン.html
```

パスワード：`Asahi101`

## 🆘 それでも動かない場合

スクリーンショットを送ってください。
