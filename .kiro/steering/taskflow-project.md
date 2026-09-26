# TaskFlow プロジェクト開発方針

TaskFlow は [Kiro University Challenge](https://kiro.dev) を通して開発している、小規模で初心者向けの React + TypeScript ToDo 管理アプリです。フロントエンドのみで完結し、データ永続化には localStorage を使用します。

---

## Feature Spec の参照

- 機能要件と設計判断の唯一の正（source of truth）は `.kiro/specs/taskflow-todo-app/` にある Feature Spec
- 実装前に `requirements.md` と `design.md` を確認する
- Spec と矛盾する実装をしない

---

## 実装方針

- **シンプルさを最優先** — 不要な抽象化・過度なレイヤー分けを避ける
- **外部依存は最小限** — 承認なく新ライブラリを追加しない。使用する技術スタックは `design.md` の技術スタック表を参照（Vite / React 18 / TypeScript / CSS Modules / Vitest / fast-check）
- **プロジェクト範囲を維持** — バックエンド・認証・サーバーサイドの機能を追加しない

---

## コーディング規約

- React / TypeScript の一般的な規約に従う
- コンポーネントは関数コンポーネント + Hooks で記述
- 型を明示し、`any` の使用を避ける
- **命名規則**: 役割に応じて使い分ける
  - React コンポーネントのファイル・名前: PascalCase（例: `TaskItem.tsx`）
  - カスタム Hook のファイル・名前: `use` プレフィックス + camelCase（例: `useTaskStorage.ts`）
  - ユーティリティ・その他のファイル: camelCase（例: `storage.ts`, `taskUtils.ts`）
  - 関数・変数名: camelCase

---

## アクセシビリティとレスポンシブ

- **セマンティック HTML を優先する** — `<button>`, `<input>`, `<dialog>` など適切なネイティブ要素を使用することで、ブラウザ標準のキーボード操作・フォーカス制御を活用する
- カスタムウィジェット等でネイティブ要素では対応できない場合に限り、適切なフォーカス管理を追加実装する
- 適切な ARIA 属性を付与する（各コンポーネントの仕様は `design.md` の Components and Interfaces を参照）
- 画面幅 320px 以上で水平スクロールなしに表示できること

---

## テスト

- 新機能・バグ修正にはテストを書く
- テスト対象に応じてツールを使い分ける
  - コンポーネント・インタラクションのテスト: Vitest + React Testing Library
  - 純粋関数・ユーティリティの普遍的な特性検証: Vitest + fast-check（プロパティテスト）
  - すべてのテストで両方を使う必要はない
- テスト対象・構成の詳細は `design.md` の Testing Strategy を参照
