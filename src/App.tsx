import { useCallback, useState } from 'react';
import type { FilterType, Task, TaskInput } from './types';
import { useTaskStorage } from './hooks/useTaskStorage';
import { filterTasks, generateId } from './utils/taskUtils';
import { TaskForm } from './components/TaskForm/TaskForm';
import { FilterBar } from './components/FilterBar/FilterBar';
import { TaskList } from './components/TaskList/TaskList';
import { StorageErrorBanner } from './components/StorageErrorBanner/StorageErrorBanner';
import styles from './App.module.css';

/**
 * TaskFlow のルートコンポーネント。
 *
 * - useTaskStorage から [tasks, setTasks, storageError] を受け取り、状態管理と
 *   localStorage 永続化を一元化する。
 * - filter（表示フィルター）と editingTask（編集中タスク）を自身の state として管理する。
 * - addTask / updateTask / deleteTask / toggleTask を実装し、各子コンポーネントに渡す。
 * - フィルタリングは taskUtils.filterTasks に委譲し、App 内に重複実装しない。
 * - storageError === 'load' のときは TaskList の代わりに StorageErrorBanner を全幅表示する。
 * - storageError === 'save' のときは TaskList 上部にバナーとして StorageErrorBanner を表示する。
 */
function App() {
  const [tasks, setTasks, storageError] = useTaskStorage();

  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isEditing = editingTask !== null;

  // 有効な（空白のみでない）タイトルを持つ新しい Task を追加する。
  const addTask = useCallback(
    (input: TaskInput) => {
      const current = tasks ?? [];
      const newTask: Task = {
        id: generateId(),
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        completed: false,
      };
      setTasks([...current, newTask]);
    },
    [tasks, setTasks]
  );

  // 対象 Task を更新後の入力値で置き換える（id・completed は維持）。
  const updateTask = useCallback(
    (id: string, input: TaskInput) => {
      const current = tasks ?? [];
      setTasks(
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                title: input.title,
                description: input.description,
                dueDate: input.dueDate,
              }
            : task
        )
      );
    },
    [tasks, setTasks]
  );

  // 対象 Task を Task_List から除外する。
  const deleteTask = useCallback(
    (id: string) => {
      const current = tasks ?? [];
      setTasks(current.filter((task) => task.id !== id));
    },
    [tasks, setTasks]
  );

  // 対象 Task の completed フラグを反転する。
  const toggleTask = useCallback(
    (id: string) => {
      const current = tasks ?? [];
      setTasks(
        current.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    },
    [tasks, setTasks]
  );

  // フォーム送信（新規作成 / 編集を editingTask の有無で分岐）
  const handleSubmit = useCallback(
    (input: TaskInput) => {
      if (editingTask) {
        updateTask(editingTask.id, input);
        setEditingTask(null);
      } else {
        addTask(input);
      }
    },
    [editingTask, updateTask, addTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
  }, []);

  const editingInput: TaskInput | undefined = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
      }
    : undefined;

  // フィルタリングは taskUtils に委譲する（App には重複実装しない）
  const visibleTasks = filterTasks(tasks ?? [], filter);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>TaskFlow</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.formSection} aria-label="タスクの入力">
          <h2 className={styles.sectionTitle}>
            {isEditing ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          {/*
            TaskForm は editingTask の有無でキーを切り替えることで、
            新規作成モードと編集モードの間で内部 state を確実にリセットする。
          */}
          <TaskForm
            key={editingTask ? editingTask.id : 'new'}
            initialValues={editingInput}
            onSubmit={handleSubmit}
            onCancel={isEditing ? handleCancelEdit : undefined}
          />
        </section>

        <section className={styles.listSection} aria-label="タスク一覧">
          {storageError === 'load' ? (
            // 読み込みエラー: TaskList を表示せず、エラー UI を全幅表示する
            <StorageErrorBanner error="load" />
          ) : (
            <>
              {/* 書き込みエラー: TaskList 上部にバナー表示（メモリ上のリストは維持） */}
              {storageError === 'save' && <StorageErrorBanner error="save" />}

              <FilterBar current={filter} onChange={setFilter} />

              <TaskList
                tasks={visibleTasks}
                onToggle={toggleTask}
                onEdit={handleEdit}
                onDelete={deleteTask}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
