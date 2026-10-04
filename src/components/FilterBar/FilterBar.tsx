import type { FilterType } from '../../types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  current: FilterType;
  onChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全件' },
  { value: 'pending', label: '未完了' },
  { value: 'completed', label: '完了済み' },
];

/**
 * タスクのフィルター切り替えバー。
 * 「全件」「未完了」「完了済み」の 3 ボタンをレンダリングし、
 * 現在アクティブなフィルターのボタンに aria-pressed="true" を付与する。
 */
export function FilterBar({ current, onChange }: FilterBarProps) {
  return (
    <div className={styles.filterBar} role="group" aria-label="タスクのフィルター">
      {FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = current === value;
        return (
          <button
            key={value}
            type="button"
            className={styles.button}
            aria-pressed={isActive}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
