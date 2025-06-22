---
theme: default
title: SSRアプリケーションにおけるPKCE付き認可コードフロー
css: unocss
---

# SSRアプリケーションにおけるPKCE付き認可コードフロー

OAuth 2.0の認可コードフローとPKCEの仕組みを理解する

---

# 認可コードフローとは

OAuth 2.0で最も安全な認可フロー（RFC 6749）

- クライアントアプリケーションがユーザーの代わりにリソースサーバーにアクセスする権限を取得
- アクセストークンの直接的な露出を防ぐ
- クライアントシークレットによる追加のセキュリティ層
- Webアプリケーションで推奨される標準的なフロー

---

# 認可コードフローの流れ

```mermaid {scale: 0.6}
sequenceDiagram
    participant RO as Resource Owner
    participant UA as User-Agent
    participant C as Client
    participant AS as Auth Server
    participant RS as Resource Server

    RO->>UA: (A) アクセス要求
    UA->>C:
    C->>UA: (B) 認可エンドポイントへリダイレクト
    UA->>AS:
    AS->>RO: (C) 認証要求
    RO->>AS: (C) 認証情報・認可
    AS->>UA: (D) 認可コード付きリダイレクト
    UA->>C:
    C->>AS: (E) トークン要求 (認可コード + クライアント認証)
    AS->>C: (F) トークン応答 (アクセストークン等)
    C->>RS: (G) アクセストークンでAPI呼び出し
    RS->>C: (H) 保護されたリソース
```

---

# PKCE付き認可コードフローとは

Proof Key for Code Exchange (PKCE) - 認可コードフローの拡張（RFC 7636）

- パブリッククライアント（SPAやモバイルアプリ）向けのセキュリティ強化
- 認可コード横取り攻撃を防ぐ
- クライアントシークレットが安全に保管できない環境でも使用可能
- 動的に生成されるcode_verifierとcode_challengeを使用

---

# PKCE付き認可コードフローの流れ

```mermaid {scale: 0.46}
sequenceDiagram
    participant RO as Resource Owner
    participant UA as User-Agent
    participant C as Client
    participant AS as Auth Server
    participant RS as Resource Server

    C->>C: (A) code_verifier/challenge生成
    RO->>UA: (B) アクセス要求
    UA->>C:
    C->>UA: (C) 認可エンドポイントへリダイレクト (+ code_challenge)
    UA->>AS:
    AS->>AS: code_challenge保存
    AS->>RO: (D) 認証要求
    RO->>AS: (D) 認証情報・認可
    AS->>UA: (E) 認可コード付きリダイレクト
    UA->>C:
    C->>AS: (F) トークン要求 (認可コード + code_verifier)
    AS->>AS: (G) code_verifier検証
    AS->>C: (H) トークン応答 (アクセストークン等)
    C->>RS: (I) アクセストークンでAPI呼び出し
    RS->>C: (J) 保護されたリソース
```

---
