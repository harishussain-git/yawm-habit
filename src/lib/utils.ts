export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getProgressPercent(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
}

export function getProgressColorClass(completed: number, total: number) {
  const percent = getProgressPercent(completed, total);

  if (percent <= 32) {
    return "bg-[#ff5f58]";
  }

  if (percent <= 65) {
    return "bg-[#f0a84f]";
  }

  return "bg-[#64c95d]";
}
