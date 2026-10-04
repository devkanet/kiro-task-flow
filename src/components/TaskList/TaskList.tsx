import type { Task } from '../../types';
import { TaskItem } from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[]; // フィルター適用済みのリスト
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * フィルター適用済みの Task[] を受け取り、TaskItem を一覧レンダリングする。
 * リストが空の場合は空状態メッセージを表示する。
 */
export function TaskList({ tasks, onToggle, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className={styles.empty}>タスクがありません</p>;
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </ul>
  );
}
