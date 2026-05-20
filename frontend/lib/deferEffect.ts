/**
 * Run a task after the current effect flush so data-loading callbacks
 * that call setState are not flagged by `react-hooks/set-state-in-effect`.
 */
export function deferEffectTask(task: () => void): () => void {
  const id = window.setTimeout(task, 0);
  return () => window.clearTimeout(id);
}
