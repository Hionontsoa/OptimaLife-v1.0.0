/**
 * Utilitaires partagés - Stockage, authentification, calculs financiers
 * Tous les helpers centralisés pour localStorage, API, et calculs
 */

import type { Transaction, Category, Task, Goal } from '../types';

// --- Clés de stockage localStorage ---
export const StorageKeys = {
  TRANSACTIONS: 'zen_transactions',
  TASKS: 'zen_tasks',
  GOALS: 'zen_goals',
  CURRENCY: 'zen_currency',
  USERS: 'zen_users',
  PIN: 'zen_pin',
  BIOMETRIC: 'zen_biometric',
  DARK_MODE: 'zen_dark_mode',
  NOTIFICATIONS: 'zen_notifications',
  USERNAME: 'zen_username',
  BUDGET_LIMITS: 'zen_budget_limits',
  TASK_RECURRENCE: 'zen_task_recurrence',
  COMPLETED_GOALS: 'zen_completed_goals',
  SUB_GOALS: 'zen_sub_goals',
  BACKUP_DATA: 'zen_backup_data',
  LAST_BACKUP: 'zen_last_backup',
} as const;

// --- Interface pour les identifiants utilisateur ---
export interface UserCredentials {
  username: string;
  password: string;
}

// --- Catégories initiales ---
export const INITIAL_CATEGORIES: Category[] = [
  // ===== INCOME =====
  { id: 1, name: 'Salaire', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 2, name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3B82F6' },
  { id: 3, name: 'Business', type: 'income', icon: 'Store', color: '#22C55E' },
  { id: 4, name: 'Trading', type: 'income', icon: 'TrendingUp', color: '#059669' },
  { id: 5, name: 'Investissement', type: 'income', icon: 'BarChart', color: '#16A34A' },
  { id: 6, name: 'Bonus', type: 'income', icon: 'Gift', color: '#84CC16' },
  { id: 7, name: 'Location', type: 'income', icon: 'Home', color: '#15803D' },
  { id: 8, name: 'Autres revenus', type: 'income', icon: 'PlusCircle', color: '#34D399' },

  // ===== EXPENSE =====
  { id: 9, name: 'Alimentation', type: 'expense', icon: 'Utensils', color: '#F59E0B' },
  { id: 10, name: 'Transport', type: 'expense', icon: 'Car', color: '#EF4444' },
  { id: 11, name: 'Loyer', type: 'expense', icon: 'Home', color: '#DC2626' },
  { id: 12, name: 'Électricité', type: 'expense', icon: 'Zap', color: '#F97316' },
  { id: 13, name: 'Eau', type: 'expense', icon: 'Droplet', color: '#0EA5E9' },
  { id: 14, name: 'Internet', type: 'expense', icon: 'Wifi', color: '#6366F1' },
  { id: 15, name: 'Téléphone', type: 'expense', icon: 'Smartphone', color: '#8B5CF6' },
  { id: 16, name: 'Santé', type: 'expense', icon: 'HeartPulse', color: '#EC4899' },
  { id: 17, name: 'Éducation', type: 'expense', icon: 'GraduationCap', color: '#06B6D4' },
  { id: 18, name: 'Divertissement', type: 'expense', icon: 'Gamepad', color: '#A855F7' },
  { id: 19, name: 'Vêtements', type: 'expense', icon: 'Shirt', color: '#F43F5E' },
  { id: 20, name: 'Abonnements', type: 'expense', icon: 'CreditCard', color: '#7C3AED' },
  { id: 21, name: 'Épargne', type: 'expense', icon: 'PiggyBank', color: '#14B8A6' },
  { id: 22, name: 'Don', type: 'expense', icon: 'HandHeart', color: '#F472B6' },
  { id: 23, name: 'Autres dépenses', type: 'expense', icon: 'MinusCircle', color: '#9CA3AF' },
];

// --- STOCKAGE: Récupérer les données du localStorage avec fallback ---
export const getStorageData = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Erreur lecture ${key}:`, e);
    return defaultValue;
  }
};

// --- STOCKAGE: Sauvegarder les données dans localStorage ---
export const setStorageData = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erreur écriture ${key}:`, e);
  }
};

// --- AUTHENTIFICATION: Valider les identifiants de connexion ---
export const validateCredentials = (username: string, password: string): boolean => {
  // Valider les longueurs minimales
  if (!username || username.length < 3) return false;
  if (!password || password.length < 4) return false;
  
  // Mode démo: accepter demo/demo ou n'importe quel identifiant valide
  if (username === 'demo' && password === 'demo') return true;
  
  // Vérifier dans les utilisateurs enregistrés
  const users = getStorageData<UserCredentials[]>(StorageKeys.USERS, []);
  return users.some(u => u.username === username && u.password === password);
};

// --- AUTHENTIFICATION: Enregistrer un nouvel utilisateur ---
export const registerUser = (username: string, password: string): boolean => {
  // Validation des critères
  if (!username || username.length < 3) return false;
  if (!password || password.length < 4) return false;
  if (username === 'demo') return false; // Réserver le compte démo
  
  const users = getStorageData<UserCredentials[]>(StorageKeys.USERS, []);
  
  // Vérifier si l'utilisateur existe déjà
  if (users.some(u => u.username === username)) return false;
  
  // Ajouter le nouvel utilisateur
  users.push({ username, password });
  setStorageData(StorageKeys.USERS, users);
  return true;
};

// --- INITIALISATION: Préparer les données pour un nouvel utilisateur ---
export const initializeUserData = () => {
  // Transactions vierges au premier lancement
  if (!localStorage.getItem(StorageKeys.TRANSACTIONS)) {
    setStorageData(StorageKeys.TRANSACTIONS, []);
  }
  // Tâches vierges au premier lancement
  if (!localStorage.getItem(StorageKeys.TASKS)) {
    setStorageData(StorageKeys.TASKS, []);
  }
  // Objectifs vierges au premier lancement
  if (!localStorage.getItem(StorageKeys.GOALS)) {
    setStorageData(StorageKeys.GOALS, []);
  }
  // Devise par défaut
  if (!localStorage.getItem(StorageKeys.CURRENCY)) {
    setStorageData(StorageKeys.CURRENCY, '€');
  }
};

// --- CALCULS: Calculer les statistiques par catégorie ---
export const calculateCategoryStats = (transactions: Transaction[]): any[] => {
  // Grouper les dépenses par catégorie
  const stats: Record<string, { name: string; value: number; color: string }> = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!stats[t.category_name]) {
        stats[t.category_name] = { name: t.category_name, value: 0, color: t.category_color };
      }
      stats[t.category_name].value += t.amount;
    });

  return Object.values(stats);
};

// --- CALCULS: Calculer la balance, revenus et dépenses ---
export const calculateBalance = (transactions: Transaction[]): { balance: number; income: number; expenses: number } => {
  let income = 0;
  let expenses = 0;
  
  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  });
  
  return {
    balance: income - expenses,
    income,
    expenses
  };
};

// --- DONNÉES: Générer les données d'activité pour le graphique ---
export const generateActivityData = (transactions: Transaction[], period: string): any[] => {
  if (period === 'week') {
    // Jours de la semaine
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = daysOfWeek.map(label => ({ label, income: 0, expense: 0 }));
    
    // Aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Début de la semaine (lundi) - JavaScript: dimanche=0, donc on recalcule
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
    startOfWeek.setDate(diff);
    
    // Pour chaque transaction, déterminer son jour dans la semaine
    transactions.forEach(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      
      // Vérifier si la transaction est dans cette semaine
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      if (txDate >= startOfWeek && txDate <= endOfWeek) {
        // Déterminer le jour de la semaine (0 = dimanche)
        const dayIndex = txDate.getDay();
        
        if (t.type === 'income') {
          data[dayIndex].income += t.amount;
        } else {
          data[dayIndex].expense += t.amount;
        }
      }
    });
    
    return data;
  }
  
  // Pour les mois: retourner les 4 semaines du mois courant
  if (period === 'month') {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const data = [
      { label: 'S1', income: 0, expense: 0 },
      { label: 'S2', income: 0, expense: 0 },
      { label: 'S3', income: 0, expense: 0 },
      { label: 'S4', income: 0, expense: 0 },
    ];
    
    transactions.forEach(t => {
      const txDate = new Date(t.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        // Déterminer la semaine du mois (1-4)
        const dayOfMonth = txDate.getDate();
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        weekIndex = Math.min(weekIndex, 3); // Maximum 4 semaines
        
        if (t.type === 'income') {
          data[weekIndex].income += t.amount;
        } else {
          data[weekIndex].expense += t.amount;
        }
      }
    });
    
    return data;
  }
  
  // Pour l'année: retourner les 12 mois de l'année courante
  const currentYear = new Date().getFullYear();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const data = monthNames.map(label => ({ label, income: 0, expense: 0 }));
  
  transactions.forEach(t => {
    const txDate = new Date(t.date);
    if (txDate.getFullYear() === currentYear) {
      const monthIndex = txDate.getMonth();
      if (t.type === 'income') {
        data[monthIndex].income += t.amount;
      } else {
        data[monthIndex].expense += t.amount;
      }
    }
  });
  
  return data;
};

// --- API: Gestionnaire centralisé utilisant localStorage comme "backend" ---
export const apiFetch = async (url: string, options: any = {}): Promise<Response> => {
  // Petit délai pour simuler une requête réseau
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    let responseData: any = null;
    let status = 200;

    // --- ROUTES DE LECTURE ---
    if (url === '/api/summary') {
      const transactions = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const { balance, income, expenses } = calculateBalance(transactions);
      const recentTransactions = transactions.slice(-3).reverse();
      const currency = getStorageData<string>(StorageKeys.CURRENCY, '€');
      responseData = {
        balance,
        income,
        expenses,
        currency,
        recentTransactions
      };
    } 
    else if (url === '/api/transactions') {
      responseData = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
    } 
    else if (url === '/api/categories') {
      responseData = INITIAL_CATEGORIES;
    } 
    else if (url === '/api/finance/category-stats') {
      const transactions = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      responseData = calculateCategoryStats(transactions);
    } 
    else if (url === '/api/tasks') {
      responseData = getStorageData<Task[]>(StorageKeys.TASKS, []);
    } 
    else if (url === '/api/goals') {
      responseData = getStorageData<Goal[]>(StorageKeys.GOALS, []);
    } 
    else if (url.match(/\/api\/goals\/(\d+)$/)) {
      const goals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const id = parseInt(url.split('/').pop() || '0');
      responseData = goals.find(g => g.id === id) || null;
      if (!responseData) status = 404;
    } 
    else if (url.match(/\/api\/stats\/activity/)) {
      // Générer des données d'activité basées sur les transactions réelles
      const transactions = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const period = new URL('http://localhost' + url).searchParams.get('period') || 'week';
      responseData = generateActivityData(transactions, period);
    }
    // --- ROUTES D'ÉCRITURE (POST, DELETE, PATCH) ---
    else if (url === '/api/transactions' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      const transactions = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const newId = Math.max(0, ...transactions.map(t => t.id)) + 1;
      
      const categories = INITIAL_CATEGORIES;
      const category = categories.find(c => c.id === body.category_id);
      
      const newTransaction: Transaction = {
        id: newId,
        ...body,
        category_name: category?.name || 'Autre',
        category_icon: category?.icon || 'Wallet',
        category_color: category?.color || '#000000',
      };
      
      transactions.push(newTransaction);
      setStorageData(StorageKeys.TRANSACTIONS, transactions);
      responseData = newTransaction;
    }
    else if (url.match(/\/api\/transactions\/(\d+)$/) && options.method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0');
      const transactions = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const filtered = transactions.filter(t => t.id !== id);
      setStorageData(StorageKeys.TRANSACTIONS, filtered);
      responseData = { success: true };
    }
    else if (url === '/api/tasks' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      const tasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
      const newTask: Task = {
        id: newId,
        ...body,
      };
      tasks.push(newTask);
      setStorageData(StorageKeys.TASKS, tasks);
      responseData = newTask;
    }
    else if (url.match(/\/api\/tasks\/(\d+)$/) && options.method === 'PATCH') {
      const id = parseInt(url.split('/').pop() || '0');
      const body = JSON.parse(options.body);
      const tasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...body };
        setStorageData(StorageKeys.TASKS, tasks);
        responseData = tasks[taskIndex];
      } else {
        status = 404;
      }
    }
    else if (url.match(/\/api\/tasks\/(\d+)$/) && options.method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0');
      const tasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const filtered = tasks.filter(t => t.id !== id);
      setStorageData(StorageKeys.TASKS, filtered);
      responseData = { success: true };
    }
    else if (url === '/api/goals' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      const goals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const newId = Math.max(0, ...goals.map(g => g.id)) + 1;
      const newGoal: Goal = {
        id: newId,
        ...body,
        contributions: [],
      };
      goals.push(newGoal);
      setStorageData(StorageKeys.GOALS, goals);
      responseData = newGoal;
    }
    else if (url.match(/\/api\/goals\/(\d+)$/) && options.method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0');
      const goals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const filtered = goals.filter(g => g.id !== id);
      setStorageData(StorageKeys.GOALS, filtered);
      responseData = { success: true };
    }
    else if (url.match(/\/api\/goals\/(\d+)\/contributions$/) && options.method === 'POST') {
      const id = parseInt(url.split('/')[3]);
      const body = JSON.parse(options.body);
      const goals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const goal = goals.find(g => g.id === id);
      if (goal) {
        goal.current_amount += body.amount;
        setStorageData(StorageKeys.GOALS, goals);
        responseData = { success: true };
      } else {
        status = 404;
      }
    }
    else {
      responseData = { success: true };
    }

    return new Response(JSON.stringify(responseData), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'API Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
