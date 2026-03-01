import { 
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  Target, 
  Settings,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Utensils,
  Car,
  GraduationCap,
  TrendingUp,
  Gamepad2,
  Briefcase,
  ShoppingBag,
  HeartPulse,
  Home,
  Laptop,
  Store,
  BarChart,
  Gift,
  PlusCircle,
  Zap,
  Droplet,
  Wifi,
  Smartphone,
  Shirt,
  CreditCard,
  PiggyBank,
  HandHeart,
  MinusCircle
} from "lucide-react";

export const ICONS = {
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  Target, 
  Settings,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Utensils,
  Car,
  GraduationCap,
  TrendingUp,
  Gamepad2,
  Briefcase,
  ShoppingBag,
  HeartPulse,
  Home,
  Laptop,
  Store,
  BarChart,
  Gift,
  PlusCircle,
  Zap,
  Droplet,
  Wifi,
  Smartphone,
  Shirt,
  CreditCard,
  PiggyBank,
  HandHeart,
  MinusCircle
};

export type Transaction = {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category_name: string;
  category_icon: string;
  category_color: string;
};

export type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
};

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  due_date: string;
  reminder_time?: string;
  priority: 'low' | 'medium' | 'high';
};

export type Goal = {
  id: number;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  contributions: Contribution[];
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
};

export type Contribution = {
  id: number;
  goal_id: number;
  amount: number;
  date: string;
  note?: string;
};

export type SubGoal = {
  id: number;
  goal_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  completed: boolean;
  order: number;
};

export type BudgetCategory = {
  id: number;
  category_id: number;
  monthly_limit: number;
  alert_threshold: number;
  color?: string;
};

export type TaskRecurrence = {
  id: number;
  task_id: number;
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  end_date?: string;
  interval: number;
  next_due?: string;
};
