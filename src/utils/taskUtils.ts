import { Task, FilterType } from '../types';

// FilterType に応じて Task[] を絞り込む（純粋関数）
export function filterTasks(tasks: Task[], filter: FilterType): Task[] {
  switch (filter) {
    case 'all':
      return tasks;
    case 'pending':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
  }
}

// crypto.randomUUID() を薄くラップ
export function generateId(): string {
  return crypto.randomUUID();
}
