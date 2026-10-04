import { useId, useState } from 'react';
import type { Task } from '../../types';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * タスク 1 件を表示するコンポーネント。
 * タイトル・説明（設定時のみ）・期限（設定時のみ）・完了状態を表示する。
 * 完了状態に応じてタイトルに打ち消し線を適用し、
 * ネイティブ <input type="checkbox"> で完了切り替えを提供する。
 * 削除ボタン押下で ConfirmDialog を表示する。
 */
export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const titleId = useId();
  const descriptionId = useId();
  const dueDateId = useId();

  const describedBy =
    [task.description ? descriptionId : null, task.dueDate ? dueDateId : null]
      .filter((id): id is string => id !== null)
      .join(' ') || undefined;

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete();
  };

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.completed}
        onChange={onToggle}
        aria-labelledby={titleId}
        aria-describedby={describedBy}
      />

      <div className={styles.content}>
        <span
          id={titleId}
          className={`${styles.title} ${
            task.completed ? styles.completed : ''
          }`}
        >
          {task.title}
        </span>

        {task.description && (
          <p id={descriptionId} className={styles.description}>
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <p id={dueDateId} className={styles.dueDate}>
            期限: {task.dueDate}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.edit} onClick={onEdit}>
          編集
        </button>
        <button
          type="button"
          className={styles.delete}
          onClick={() => setIsConfirmOpen(true)}
        >
          削除
        </button>
      </div>

      {isConfirmOpen && (
        <ConfirmDialog
          taskTitle={task.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </li>
  );
}
