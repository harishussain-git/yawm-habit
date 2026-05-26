export type Habit = {
  id: string;
  title: string;
  category: string;
};

export type User = {
  id: string;
  name: string;
  initials: string;
};

export type HabitStatus = {
  habitId: string;
  completed: boolean;
};

export type DaySummary = {
  date: string;
  dayName: string;
  fullDate: string;
  hijriDate: string;
  completed: number;
  total: number;
};

export type ReviewStatus = {
  habitId: string;
  userId: string;
  completed: boolean;
};
