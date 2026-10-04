import { describe, test, expect } from 'vitest';
import { filterTasks } from './taskUtils';
import type { Task } from '../types';

// テスト用のタスクデータ
const pendingTask1: Task = {
  id: '1',
  title: 'Pending Task 1',
  description: '',
  dueDate: '',
  completed: false,
};

const pendingTask2: Task = {
  id: '2',
  title: 'Pending Task 2',
  description: 'Some description',
  dueDate: '2025-12-31',
  completed: false,
};

const completedTask1: Task = {
  id: '3',
  title: 'Completed Task 1',
  description: '',
  dueDate: '',
  completed: true,
};

const completedTask2: Task = {
  id: '4',
  title: 'Completed Task 2',
  description: 'Another description',
  dueDate: '2025-06-01',
  completed: true,
};

const mixedTasks: Task[] = [pendingTask1, completedTask1, pendingTask2, completedTask2];

describe('filterTasks', () => {
  describe('all フィルター', () => {
    test('全 Task を返す', () => {
      const result = filterTasks(mixedTasks, 'all');
      expect(result).toEqual(mixedTasks);
    });

    test('空配列に適用すると空配列を返す', () => {
      const result = filterTasks([], 'all');
      expect(result).toEqual([]);
    });

    test('全件 pending のリストに適用すると全件を返す', () => {
      const allPending = [pendingTask1, pendingTask2];
      const result = filterTasks(allPending, 'all');
      expect(result).toEqual(allPending);
    });

    test('全件 completed のリストに適用すると全件を返す', () => {
      const allCompleted = [completedTask1, completedTask2];
      const result = filterTasks(allCompleted, 'all');
      expect(result).toEqual(allCompleted);
    });
  });

  describe('pending フィルター', () => {
    test('Pending_Task のみを返す', () => {
      const result = filterTasks(mixedTasks, 'pending');
      expect(result).toEqual([pendingTask1, pendingTask2]);
    });

    test('すべての結果が completed: false であること', () => {
      const result = filterTasks(mixedTasks, 'pending');
      result.forEach((task) => {
        expect(task.completed).toBe(false);
      });
    });

    test('空配列に適用すると空配列を返す', () => {
      const result = filterTasks([], 'pending');
      expect(result).toEqual([]);
    });

    test('全件 completed のリストに適用すると 0 件を返す', () => {
      const allCompleted = [completedTask1, completedTask2];
      const result = filterTasks(allCompleted, 'pending');
      expect(result).toHaveLength(0);
    });

    test('全件 pending のリストに適用すると全件を返す', () => {
      const allPending = [pendingTask1, pendingTask2];
      const result = filterTasks(allPending, 'pending');
      expect(result).toEqual(allPending);
    });
  });

  describe('completed フィルター', () => {
    test('Completed_Task のみを返す', () => {
      const result = filterTasks(mixedTasks, 'completed');
      expect(result).toEqual([completedTask1, completedTask2]);
    });

    test('すべての結果が completed: true であること', () => {
      const result = filterTasks(mixedTasks, 'completed');
      result.forEach((task) => {
        expect(task.completed).toBe(true);
      });
    });

    test('空配列に適用すると空配列を返す', () => {
      const result = filterTasks([], 'completed');
      expect(result).toEqual([]);
    });

    test('全件 pending のリストに適用すると 0 件を返す', () => {
      const allPending = [pendingTask1, pendingTask2];
      const result = filterTasks(allPending, 'completed');
      expect(result).toHaveLength(0);
    });

    test('全件 completed のリストに適用すると全件を返す', () => {
      const allCompleted = [completedTask1, completedTask2];
      const result = filterTasks(allCompleted, 'completed');
      expect(result).toEqual(allCompleted);
    });
  });
});

import * as fc from 'fast-check';

const taskArb = fc.record({
  id: fc.string(),
  title: fc.string(),
  description: fc.string(),
  dueDate: fc.string(),
  completed: fc.boolean(),
});

// Feature: taskflow-todo-app, Property 6: フィルタリングの正当性と網羅性
describe('Property 6: フィルタリングの正当性と網羅性', () => {
  test('Property 6: filterTasks の結果がフィルター条件を満たし（精度）、条件を満たすタスクが漏れない（再現率）', () => {
    // Validates: Requirements 6.2, 6.3, 6.4
    fc.assert(
      fc.property(
        fc.array(taskArb),
        fc.constantFrom('all' as const, 'pending' as const, 'completed' as const),
        (tasks, filter) => {
          const result = filterTasks(tasks, filter);

          if (filter === 'all') {
            // 精度: 結果は元のリストと同一
            expect(result).toEqual(tasks);
            // 再現率: 元リストの全タスクが含まれる
            expect(result.length).toBe(tasks.length);
          } else if (filter === 'pending') {
            // 精度: 結果の全タスクが completed === false
            result.forEach((task) => {
              expect(task.completed).toBe(false);
            });
            // 再現率: 元リストの completed === false のタスクが全件含まれる
            const expectedCount = tasks.filter((t) => !t.completed).length;
            expect(result.length).toBe(expectedCount);
          } else {
            // filter === 'completed'
            // 精度: 結果の全タスクが completed === true
            result.forEach((task) => {
              expect(task.completed).toBe(true);
            });
            // 再現率: 元リストの completed === true のタスクが全件含まれる
            const expectedCount = tasks.filter((t) => t.completed).length;
            expect(result.length).toBe(expectedCount);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

import { generateId } from './taskUtils';
import type { TaskInput } from '../types';

// 有効な（空白のみでない）タイトルを持つ TaskInput を生成するアービトラリー。
const nonBlankTitleArb = fc.string().filter((s) => s.trim() !== '');

const validTaskInputArb: fc.Arbitrary<TaskInput> = fc.record({
  title: nonBlankTitleArb,
  description: fc.string(),
  dueDate: fc.string(),
});

// App.addTask と同一の追加ロジック（TaskInput から completed:false の Task を生成して末尾に追加）。
// Task_List への追加操作をモデル化する。
function addTask(tasks: Task[], input: TaskInput): Task[] {
  const newTask: Task = {
    id: generateId(),
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    completed: false,
  };
  return [...tasks, newTask];
}

// Feature: taskflow-todo-app, Property 1: 有効タスク追加によるリスト増加
describe('Property 1: 有効タスク追加によるリスト増加', () => {
  test('有効な TaskInput を追加するとリスト長が +1 になり、追加タスクのフィールドが入力値と一致する', () => {
    // Validates: Requirements 1.1
    fc.assert(
      fc.property(fc.array(taskArb), validTaskInputArb, (tasks, input) => {
        const result = addTask(tasks, input);

        // リスト長が元より 1 だけ大きい
        expect(result.length).toBe(tasks.length + 1);

        // 追加された Task のフィールドが TaskInput の値と一致する
        const added = result[result.length - 1];
        expect(added.title).toBe(input.title);
        expect(added.description).toBe(input.description);
        expect(added.dueDate).toBe(input.dueDate);
        // 新規タスクは未完了で、生成された id を持つ
        expect(added.completed).toBe(false);
        expect(typeof added.id).toBe('string');

        // 既存タスクはそのまま保持される
        expect(result.slice(0, tasks.length)).toEqual(tasks);
      }),
      { numRuns: 100 }
    );
  });
});
