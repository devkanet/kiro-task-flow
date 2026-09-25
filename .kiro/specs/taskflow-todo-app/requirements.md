# Requirements Document

## Introduction

TaskFlow は React + TypeScript で構築されたシンプルな ToDo 管理 Web アプリです。
ユーザーはタスクの追加・編集・削除・完了切り替えを行えます。各タスクにはタイトル・任意の説明・期限を設定でき、データはブラウザの localStorage に永続化されます。バックエンドやログインは不要で、レスポンシブな UI を提供します。

## Glossary

- **App**: TaskFlow アプリケーション全体
- **Task**: タイトル・説明（任意）・期限・完了状態を持つ ToDo の 1 件
- **Task_List**: 現在のセッションで管理されている Task の集合
- **Task_Form**: Task を作成または編集するための入力フォーム
- **Storage**: ブラウザの localStorage を利用したデータ永続化レイヤー
- **Filter**: Task_List を完了状態（全件 / 未完了 / 完了済み）で絞り込む機能
- **Due_Date**: Task に設定された期限日（YYYY-MM-DD 形式）
- **Completed_Task**: `completed` フラグが `true` の Task
- **Pending_Task**: `completed` フラグが `false` の Task

---

## Requirements

### Requirement 1: タスクの作成

**User Story:** As a ユーザー, I want タスクを新規作成したい, so that やるべきことを記録できる

#### Acceptance Criteria

1. WHEN ユーザーが Task_Form にタイトルを入力して送信操作を行ったとき, THE App SHALL タイトル・説明（空文字可）・期限（未設定可）・`completed: false` を持つ新しい Task を Task_List に追加する
2. WHEN ユーザーが Task_Form を送信したとき, THE App SHALL 追加した Task を Storage に保存する
3. IF Task_Form のタイトルが空文字または空白のみであるとき, THEN THE App SHALL タスクの追加を拒否し、タイトルが必須である旨のバリデーションメッセージを表示する
4. WHEN タスクの追加が完了したとき, THE App SHALL Task_Form の全入力フィールドを空の初期状態にリセットする

---

### Requirement 2: タスクの表示

**User Story:** As a ユーザー, I want 登録したタスクを一覧で確認したい, so that 現在のタスク状況を把握できる

#### Acceptance Criteria

1. THE App SHALL 起動時に Storage から Task_List を読み込み、Task_List に含まれる全 Task を一覧表示する
2. THE App SHALL 各 Task に対して、タイトル・説明（設定されている場合）・Due_Date（設定されている場合）・完了状態を表示する
3. WHEN Task_List が空のとき, THE App SHALL 「タスクがありません」に相当する空状態メッセージを表示する
4. THE App SHALL 画面幅が 768px 未満のモバイル端末においても、Task_List が崩れずに表示されるレスポンシブレイアウトを提供する

---

### Requirement 3: タスクの編集

**User Story:** As a ユーザー, I want 既存のタスクを編集したい, so that 内容の変更や誤入力を修正できる

#### Acceptance Criteria

1. WHEN ユーザーが Task の編集操作を起動したとき, THE App SHALL 対象 Task の現在のタイトル・説明・Due_Date が入力済みの状態で Task_Form を表示する
2. WHEN ユーザーが編集内容を確定したとき, THE App SHALL Task_List 内の対象 Task を更新後の値で置き換える
3. WHEN ユーザーが編集内容を確定したとき, THE App SHALL 更新した Task を Storage に保存する
4. IF 編集後のタイトルが空文字または空白のみであるとき, THEN THE App SHALL 保存を拒否し、タイトルが必須である旨のバリデーションメッセージを表示する
5. WHEN ユーザーが編集をキャンセルしたとき, THE App SHALL Task の内容を変更せずに Task_Form を閉じる

---

### Requirement 4: タスクの削除

**User Story:** As a ユーザー, I want タスクを削除したい, so that 不要なタスクを管理から除外できる

#### Acceptance Criteria

1. WHEN ユーザーが Task の削除操作を行ったとき, THE App SHALL 削除対象の Task タイトルを含む確認ダイアログを表示する
2. WHEN ユーザーが確認ダイアログで削除を承認したとき, THE App SHALL 対象 Task を Task_List から除外し、削除後の Task_List を Storage に保存する
3. WHEN ユーザーが確認ダイアログをキャンセルしたとき, THE App SHALL Task_List を変更せずに確認ダイアログを閉じる

---

### Requirement 5: 完了状態の切り替え

**User Story:** As a ユーザー, I want タスクの完了・未完了を切り替えたい, so that 進捗を管理できる

#### Acceptance Criteria

1. WHEN ユーザーが Pending_Task の完了切り替え操作を行ったとき, THE App SHALL 対象 Task の `completed` フラグを `true` に変更する
2. WHEN ユーザーが Completed_Task の完了切り替え操作を行ったとき, THE App SHALL 対象 Task の `completed` フラグを `false` に変更する
3. WHEN 完了状態の切り替えが完了したとき, THE App SHALL 更新後の Task_List を Storage に保存する
4. THE App SHALL Completed_Task と Pending_Task を視覚的に区別できるスタイル（例：打ち消し線または色の違い）で表示する

---

### Requirement 6: タスクのフィルタリング

**User Story:** As a ユーザー, I want 完了・未完了でタスクを絞り込みたい, so that 注目すべきタスクに集中できる

#### Acceptance Criteria

1. THE App SHALL「全件」「未完了」「完了済み」の 3 種類のフィルターオプションを提供する
2. WHEN ユーザーが「未完了」フィルターを選択したとき, THE App SHALL Task_List から Pending_Task のみを表示する
3. WHEN ユーザーが「完了済み」フィルターを選択したとき, THE App SHALL Task_List から Completed_Task のみを表示する
4. WHEN ユーザーが「全件」フィルターを選択したとき, THE App SHALL Task_List の全 Task を表示する
5. THE App SHALL 現在適用中のフィルターを視覚的に識別できる状態で表示する

---

### Requirement 7: データの永続化

**User Story:** As a ユーザー, I want ページをリロードしてもタスクが消えないようにしたい, so that データの再入力をしなくて済む

#### Acceptance Criteria

1. WHEN Task_List に変更（追加・更新・削除・完了切り替え）が生じたとき, THE Storage SHALL 変更後の Task_List 全体を JSON 形式でシリアライズして localStorage に書き込む
2. WHEN App が起動・リロードされたとき, THE Storage SHALL localStorage から Task_List を JSON 形式でデシリアライズして読み込む
3. FOR ALL 有効な Task_List について, localStorage への書き込みおよびその後の読み込みを行ったとき, THE Storage SHALL 元の Task_List と等価なデータを返す（ラウンドトリップ特性）
4. IF App 起動時に localStorage から読み込んだデータが不正な JSON であるとき, THEN THE App SHALL localStorage のデータを変更せずに保持し、Task_List を表示しない代わりにデータを読み込めなかった旨のエラーメッセージを UI 上に表示する
5. IF App 起動時に localStorage から読み込んだデータが想定外のスキーマを持つとき, THEN THE App SHALL localStorage のデータを変更せずに保持し、Task_List を表示しない代わりにデータを読み込めなかった旨のエラーメッセージを UI 上に表示する
6. WHEN 読み込みエラー状態のとき, THE App SHALL ユーザーが開発者ツール等で localStorage のデータを修復またはクリアしてページを再読み込みすることで復旧できることを前提とする（アプリは自動的に localStorage を修正しない）
7. IF Task_List の変更を localStorage に書き込む際にエラーが発生したとき（容量超過等）, THEN THE App SHALL 現在メモリ上の Task_List を保持したまま、保存に失敗した旨のエラーメッセージを UI 上に表示する（ページ再読み込みにより変更が失われる可能性があることを示す）

---

### Requirement 8: アクセシビリティとレスポンシブ対応

**User Story:** As a ユーザー, I want どのデバイスからでも快適に操作したい, so that 利用場所を選ばず ToDo を管理できる

#### Acceptance Criteria

1. THE App SHALL すべての操作可能な UI 要素に対して、キーボードのみで操作できるフォーカス制御を提供する
2. THE App SHALL スクリーンリーダーが各 Task の完了状態を識別できるよう、適切な ARIA 属性を付与する
3. THE App SHALL 画面幅 320px 以上のデバイスで、水平スクロールなしにコンテンツを表示する
4. THE App SHALL 文字サイズ・色コントラストについて WCAG 2.1 AA 基準を満たす

