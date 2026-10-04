import { useId, useState, type FormEvent } from 'react';
import type { TaskInput } from '../../types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  initialValues?: TaskInput; // 編集モード時に渡す
  onSubmit: (input: TaskInput) => void;
  onCancel?: () => void; // 編集モード時のキャンセル
}

const EMPTY_INPUT: TaskInput = {
  title: '',
  description: '',
  dueDate: '',
};

/**
 * タスク作成・編集フォーム。
 * initialValues が未指定なら新規作成モード、指定時は編集モードとして動作する。
 * 空白のみのタイトルは送信を拒否し、バリデーションメッセージを表示する。
 */
export function TaskForm({ initialValues, onSubmit, onCancel }: TaskFormProps) {
  const isEditMode = initialValues !== undefined;

  const [title, setTitle] = useState<string>(initialValues?.title ?? '');
  const [description, setDescription] = useState<string>(
    initialValues?.description ?? ''
  );
  const [dueDate, setDueDate] = useState<string>(initialValues?.dueDate ?? '');
  const [error, setError] = useState<string | null>(null);

  const titleErrorId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 空白のみのタイトルを拒否する
    if (title.trim() === '') {
      setError('タイトルは必須です');
      return;
    }

    onSubmit({ title, description, dueDate });
    setError(null);

    // 新規作成モード時のみ入力フィールドを初期状態にリセットする
    if (!isEditMode) {
      setTitle(EMPTY_INPUT.title);
      setDescription(EMPTY_INPUT.description);
      setDueDate(EMPTY_INPUT.dueDate);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-title">
          タイトル
        </label>
        <input
          id="task-title"
          className={styles.input}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-required="true"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? titleErrorId : undefined}
        />
        {error !== null && (
          <p id={titleErrorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-description">
          説明
        </label>
        <textarea
          id="task-description"
          className={styles.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-due-date">
          期限
        </label>
        <input
          id="task-due-date"
          className={styles.input}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          {isEditMode ? '保存' : '追加'}
        </button>
        {isEditMode && onCancel && (
          <button type="button" className={styles.cancel} onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
