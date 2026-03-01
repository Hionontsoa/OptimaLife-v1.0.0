/**
 * Utilitaires d'Analyses - Calculs et génération de rapports
 * Analyse des dépenses, tendances, alertes budgétaires et statistiques
 */

import type { Transaction, Goal, Task } from '../types';
import { getStorageData, setStorageData, StorageKeys } from './utilitaires';

// --- 1. ANALYSE DES TENDANCES ---
export const calculateMonthlyTrend = (transactions: Transaction[]): Record<string, { income: number; expense: number }> => {
  const trend: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    const date = new Date(t.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!trend[yearMonth]) {
      trend[yearMonth] = { income: 0, expense: 0 };
    }
    
    if (t.type === 'income') {
      trend[yearMonth].income += t.amount;
    } else {
      trend[yearMonth].expense += t.amount;
    }
  });

  return trend;
};

// --- 2. ALERTES DE DÉPASSEMENT DE BUDGET ---
export const checkBudgetAlerts = (transactions: Transaction[], budgetLimits: Record<number, number>): Array<{ categoryId: number; categoryName: string; spent: number; limit: number; percentage: number }> => {
  const alerts: Array<{ categoryId: number; categoryName: string; spent: number; limit: number; percentage: number }> = [];

  Object.entries(budgetLimits).forEach(([categoryId, limit]) => {
    const catId = parseInt(categoryId);
    const spent = transactions
      .filter(t => t.category_id === catId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / limit) * 100;

    if (percentage >= 80) {
      const category = transactions.find(t => t.category_id === catId);
      alerts.push({
        categoryId: catId,
        categoryName: category?.category_name || 'Inconnue',
        spent,
        limit,
        percentage,
      });
    }
  });

  return alerts;
};

// --- 3. STATISTIQUES D'OBJECTIFS ---
export const calculateGoalStats = (goals: Goal[]): { completed: number; active: number; total: number; averageProgress: number } => {
  const completed = goals.filter(g => g.status === 'completed').length;
  const active = goals.filter(g => g.status === 'active').length;
  const total = goals.length;
  const averageProgress = goals.length > 0 
    ? (goals.reduce((sum, g) => sum + (g.current_amount / g.target_amount), 0) / goals.length) * 100 
    : 0;

  return { completed, active, total, averageProgress };
};

// --- 4. STATISTIQUES DE PRODUCTIVITÉ ---
export const calculateTaskStats = (tasks: Task[]): { completed: number; pending: number; total: number; completionRate: number } => {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const total = tasks.length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return { completed, pending, total, completionRate };
};

// --- 5. ANALYSE PAR SEMAINE ---
export const analyzeWeeklyData = (transactions: Transaction[]): { week: string; income: number; expense: number; balance: number }[] => {
  const weeklyData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    const date = new Date(t.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { income: 0, expense: 0 };
    }

    if (t.type === 'income') {
      weeklyData[weekKey].income += t.amount;
    } else {
      weeklyData[weekKey].expense += t.amount;
    }
  });

  return Object.entries(weeklyData)
    .map(([week, data]) => ({
      week,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

// --- 6. RAPPORT MENSUEL ---
export const generateMonthlyReport = (transactions: Transaction[], month: string): { summary: any; byCategory: any[] } => {
  const [year, monthNum] = month.split('-');
  const filtered = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear().toString() === year && String(tDate.getMonth() + 1).padStart(2, '0') === monthNum;
  });

  const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const byCategory: Record<string, { name: string; amount: number; count: number }> = {};
  filtered.forEach(t => {
    if (!byCategory[t.category_name]) {
      byCategory[t.category_name] = { name: t.category_name, amount: 0, count: 0 };
    }
    byCategory[t.category_name].amount += t.amount;
    byCategory[t.category_name].count += 1;
  });

  return {
    summary: { month, income, expense, balance: income - expense, transactionCount: filtered.length },
    byCategory: Object.values(byCategory),
  };
};

// --- 7. EXPORT DE DONNÉES ---
export const exportToCSV = (data: any[], filename: string) => {
  const csv = convertToCSV(data);
  downloadCSV(csv, filename);
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    rows.push(values.join(','));
  });

  return rows.join('\n');
};

const downloadCSV = (csv: string, filename: string) => {
  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  link.download = filename;
  link.click();
};

// --- 8. EXPORT DE DONNÉES EN JSON ---
export const exportToJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const link = document.createElement('a');
  link.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  link.download = filename;
  link.click();
};

// --- 9. SAUVEGARDE AUTOMATIQUE ---
export const performAutoBackup = () => {
  const backup = {
    transactions: getStorageData('zen_transactions', []),
    tasks: getStorageData('zen_tasks', []),
    goals: getStorageData('zen_goals', []),
    timestamp: new Date().toISOString(),
  };
  
  setStorageData(StorageKeys.BACKUP_DATA, backup);
  setStorageData(StorageKeys.LAST_BACKUP, new Date().toISOString());
  console.log('✓ Sauvegarde automatique effectuée');
};

// --- 10. RAPPELS PERSONNALISÉS ---
export const generateReminders = (tasks: Task[], goals: Goal[]): Array<{ type: string; title: string; dueDate: string; priority: string }> => {
  const reminders: Array<{ type: string; title: string; dueDate: string; priority: string }> = [];

  // Rappels pour les tâches en retard
  tasks.forEach(t => {
    if (!t.completed && t.due_date) {
      const dueDate = new Date(t.due_date);
      const today = new Date();
      if (dueDate < today) {
        reminders.push({
          type: 'task_overdue',
          title: `Tâche en retard: ${t.title}`,
          dueDate: t.due_date,
          priority: t.priority,
        });
      }
    }
  });

  // Rappels pour les objectifs proches de la cible
  goals.forEach(g => {
    if (g.status === 'active') {
      const progress = (g.current_amount / g.target_amount) * 100;
      if (progress >= 80 && progress < 100) {
        reminders.push({
          type: 'goal_near_target',
          title: `Objectif proche: ${g.title}`,
          dueDate: g.deadline,
          priority: 'high',
        });
      }
    }
  });

  return reminders;
};

// --- 11. COMPARAISON BUDGET VS RÉALITÉ ---
export const compareBudgetVsReality = (transactions: Transaction[], budgets: Record<number, number>): Array<{ categoryId: number; categoryName: string; budgeted: number; actual: number; variance: number }> => {
  const comparison: Array<{ categoryId: number; categoryName: string; budgeted: number; actual: number; variance: number }> = [];

  Object.entries(budgets).forEach(([catId, budgeted]) => {
    const categoryId = parseInt(catId);
    const actual = transactions
      .filter(t => t.category_id === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const category = transactions.find(t => t.category_id === categoryId);
    comparison.push({
      categoryId,
      categoryName: category?.category_name || 'Inconnue',
      budgeted,
      actual,
      variance: actual - budgeted,
    });
  });

  return comparison;
};

// --- 12. ANALYSE DES DÉPENSES ANORMALES ---
export const detectOutliersExpenses = (transactions: Transaction[]): Transaction[] => {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const byCategory: Record<number, number[]> = {};
  expenses.forEach(e => {
    if (!byCategory[e.category_id]) {
      byCategory[e.category_id] = [];
    }
    byCategory[e.category_id].push(e.amount);
  });

  const outliers: Transaction[] = [];

  Object.entries(byCategory).forEach(([categoryId, amounts]) => {
    if (amounts.length >= 3) {
      const mean = amounts.reduce((a, b) => a + b) / amounts.length;
      const std = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2)) / amounts.length);
      
      expenses.forEach(e => {
        if (e.category_id === parseInt(categoryId) && Math.abs(e.amount - mean) > 2 * std) {
          outliers.push(e);
        }
      });
    }
  });

  return outliers;
};

// --- 13. PROJECTIONS FUTURES ---
export const projectFutureBalance = (transactions: Transaction[], months: number = 3): Array<{ month: string; projectedBalance: number }> => {
  const trend = calculateMonthlyTrend(transactions);
  const entries = Object.entries(trend).sort();
  
  if (entries.length === 0) return [];

  const recentMonths = entries.slice(-3);
  const avgMonthlyBalance = recentMonths.reduce((sum, [, { income, expense }]) => sum + (income - expense), 0) / 3;

  const projections: Array<{ month: string; projectedBalance: number }> = [];
  const lastDate = new Date(entries[entries.length - 1][0]);

  for (let i = 1; i <= months; i++) {
    const nextMonth = new Date(lastDate);
    nextMonth.setMonth(nextMonth.getMonth() + i);
    const monthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    const currentBalance = transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    projections.push({
      month: monthStr,
      projectedBalance: currentBalance + (avgMonthlyBalance * i),
    });
  }

  return projections;
};
