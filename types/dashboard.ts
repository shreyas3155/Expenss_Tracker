export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
  monthlyBudget: string;
  currency: string;
}

export interface MetricPill {
  id: string;
  label: string;
  value: string;
  variant: "dark" | "yellow" | "striped" | "outline";
}

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  icon: string;
  period?: string;
}

export interface DaySpendData {
  day: string;
  label: string;
  dateStr: string;
  amount: number;
  heightPercent: number;
  isHigh: boolean;
  isYellow?: boolean;
  isToday?: boolean;
  tooltipText?: string;
}

export interface CashFlowStats {
  currentBalance: string;
  balanceLabel: string;
  totalIncome: string;
  totalExpense: string;
  savingsRatio: number;
  gaugePercentage: number; // 0 to 100
  period: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  amount: string;
  numericAmount: number;
  percentage: number;
  barColor: "yellow" | "dark" | "muted";
  iconName: string;
  status: "active" | "planned" | "pending";
  dateFormatted?: string;
}

export interface TransactionItem {
  id: string;
  merchant: string;
  title?: string;
  category: string;
  amount: number;
  amountFormatted: string;
  type: "debit" | "credit";
  date: string; // e.g. "Sep 24, 2024"
  time: string; // e.g. "09:30 am"
  timeSlot: "8:00 am" | "9:00 am" | "10:00 am" | "11:00 am" | "12:00 pm" | "afternoon";
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  dayNumber: number;
  upiId: string;
  upiApp: "GPay" | "PhonePe" | "Paytm" | "Cred" | "BHIM";
  status: "Success" | "Pending" | "Refunded";
  avatarInitials?: string[];
  avatars?: string[];
  notes?: string;
}

export interface ExpandableListItem {
  id: string;
  title: string;
  iconName: string;
  count?: string | number;
  defaultOpen?: boolean;
  contentDetails?: {
    primaryText: string;
    secondaryText: string;
    badge?: string;
    icon?: string;
    actionable?: boolean;
  };
}

export interface DashboardData {
  user: UserProfile;
  inlineMetrics: MetricPill[];
  kpis: KpiCardData[];
  spendingProgress: {
    totalSpendThisWeek: string;
    subtitle: string;
    days: DaySpendData[];
    activeDayTag?: {
      day: string;
      tagText: string;
      dayIndex: number;
    };
  };
  cashFlow: CashFlowStats;
  categories: {
    topPercentage: string;
    topCategoriesRatio: string;
    topThreeBars: Array<{
      label: string;
      percentage: number;
      color: "yellow" | "dark" | "gray";
    }>;
    list: CategorySummary[];
  };
  sidebarItems: ExpandableListItem[];
  calendarWeek: {
    monthYear: string;
    days: Array<{
      dayName: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
      dateNumber: number;
      isToday?: boolean;
      isSelected?: boolean;
    }>;
    transactions: TransactionItem[];
  };
}
