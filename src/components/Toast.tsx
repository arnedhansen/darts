type ToastProps = {
  message: string;
  tone?: 'normal' | 'danger' | 'success';
};

export function Toast({ message, tone = 'normal' }: ToastProps) {
  const cls = tone === 'danger' ? 'toast danger' : tone === 'success' ? 'toast success' : 'toast';
  return <div className={cls}>{message}</div>;
}
