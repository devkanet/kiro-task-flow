export interface Task {
  id: string;          // crypto.randomUUID() で生成
  title: string;       // 必須、空白のみ不可
  description: string; // 任意（空文字可）
  dueDate: string;     // YYYY-MM-DD 形式、未設定時は空文字
  completed: boolean;  // 初期値 false
}

// フォームの入力値を表す型。id は含まない
export interface TaskInput {
  title: string;
  description: string;
  dueDate: string;
}

export type FilterType = 'all' | 'pending' | 'completed';
