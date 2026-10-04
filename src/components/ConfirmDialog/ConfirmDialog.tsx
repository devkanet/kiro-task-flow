import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 削除確認ダイアログ。
 * ネイティブ <dialog> 要素を使用し、フォーカストラップと ESC キーによる
 * キャンセルは <dialog> の標準動作に委ねる。
 */
export function ConfirmDialog({
  taskTitle,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // マウント時にモーダルとして開く（フォーカストラップを有効化する）
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // ESC キーやバックドロップ操作による <dialog> のキャンセルを onCancel に委譲する
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="confirm-dialog-title"
      onCancel={handleCancel}
    >
      <h2 id="confirm-dialog-title" className={styles.title}>
        タスクの削除
      </h2>
      <p className={styles.message}>
        「{taskTitle}」を削除しますか？この操作は取り消せません。
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.confirm}
          onClick={onConfirm}
        >
          削除
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </dialog>
  );
}
