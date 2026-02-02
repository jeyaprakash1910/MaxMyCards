export type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  catalog_id: string | null;
  cycle_start_day: number;
  cycle_end_day: number;
  due_date_days: number;
  created_at: string;
};

export type CreditCardWithComputed = CreditCard & {
  cycleStart: Date;
  cycleEnd: Date;
  daysLeftInCycle: number;
  dueDate: Date;
  daysUntilDue: number;
  // Past/next cycles for month filter view
  pastCycleStart: Date;
  pastCycleEnd: Date;
  pastDueDate: Date;
  nextCycleStart: Date;
  nextCycleEnd: Date;
  nextDueDate: Date;
};
