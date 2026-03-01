/**
 * Gestion Globale des Données - Contexte et Helpers CRUD
 * Système central pour gérer les transactions, tâches et objectifs
 * Assure la persistance et la synchronisation d'état
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Task, Goal } from '../types';
import { StorageKeys, getStorageData, setStorageData, INITIAL_CATEGORIES, calculateBalance, calculateCategoryStats } from './utilitaires';

// --- TYPES POUR LE CONTEXTE ---
export interface DonneesContextType {
  // États
  transactions: Transaction[];
  tasks: Task[];
  goals: Goal[];
  isLoading: boolean;

  // Actions Transactions
  ajouterTransaction: (tx: Omit<Transaction, 'id' | 'category_name' | 'category_icon' | 'category_color'>) => void;
  supprimerTransaction: (id: number) => void;
  obtenirTransactions: () => void;

  // Actions Tâches
  ajouterTache: (task: Omit<Task, 'id' | 'completed'>) => void;
  basculeCompletionTache: (id: number) => void;
  supprimerTache: (id: number) => void;
  obtenirTaches: () => void;

  // Actions Objectifs
  ajouterObjectif: (goal: Omit<Goal, 'id' | 'contributions' | 'current_amount' | 'status' | 'created_at'>) => void;
  supprimerObjectif: (id: number) => void;
  ajouterContributionObjectif: (goalId: number, amount: number) => void;
  obtenirObjectifs: () => void;

  // Utilitaires
  calculerBilan: () => { balance: number; income: number; expenses: number };
  obtenirStatsCategories: () => any[];
}

// --- CRÉATION DU CONTEXTE ---
const DonneesContext = createContext<DonneesContextType | undefined>(undefined);

// --- HOOK POUR UTILISER LE CONTEXTE ---
export const useDonnees = () => {
  const context = useContext(DonneesContext);
  if (!context) {
    throw new Error('useDonnees doit être utilisé dans DonneesProvider');
  }
  return context;
};

// --- PROVIDER POUR ENVELOPER L'APPLICATION ---
export const DonneesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- INITIALISATION: Charger les données au montage ---
  useEffect(() => {
    obtenirTransactions();
    obtenirTaches();
    obtenirObjectifs();
  }, []);

  // --- TRANSACTION: Charger toutes les transactions ---
  const obtenirTransactions = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      setTransactions(data);
      console.log(`✓ ${data.length} transactions chargées`);
    } catch (e) {
      console.error('Erreur chargement transactions:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- TRANSACTION: Ajouter une nouvelle transaction ---
  const ajouterTransaction = useCallback((tx: Omit<Transaction, 'id' | 'category_name' | 'category_icon' | 'category_color'>) => {
    try {
      const currentTx = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const newId = currentTx.length > 0 ? Math.max(...currentTx.map(t => t.id)) + 1 : 1;
      
      // Chercher la catégorie pour obtenir name, icon et color
      const category = INITIAL_CATEGORIES.find(c => c.id === tx.category_id);
      if (!category) {
        console.error(`Catégorie ${tx.category_id} non trouvée`);
        return;
      }

      const newTransaction: Transaction = {
        id: newId,
        ...tx,
        category_name: category.name,
        category_icon: category.icon,
        category_color: category.color,
      };

      const updated = [...currentTx, newTransaction];
      setStorageData(StorageKeys.TRANSACTIONS, updated);
      setTransactions(updated);
      console.log(`✓ Transaction #${newId} ajoutée (${tx.type}: ${tx.amount})`);
    } catch (e) {
      console.error('Erreur ajout transaction:', e);
    }
  }, []);

  // --- TRANSACTION: Supprimer une transaction ---
  const supprimerTransaction = useCallback((id: number) => {
    try {
      const currentTx = getStorageData<Transaction[]>(StorageKeys.TRANSACTIONS, []);
      const updated = currentTx.filter(t => t.id !== id);
      setStorageData(StorageKeys.TRANSACTIONS, updated);
      setTransactions(updated);
      console.log(`✓ Transaction #${id} supprimée`);
    } catch (e) {
      console.error('Erreur suppression transaction:', e);
    }
  }, []);

  // --- TÂCHE: Charger toutes les tâches ---
  const obtenirTaches = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getStorageData<Task[]>(StorageKeys.TASKS, []);
      setTasks(data);
      console.log(`✓ ${data.length} tâches chargées`);
    } catch (e) {
      console.error('Erreur chargement tâches:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- TÂCHE: Ajouter une nouvelle tâche ---
  const ajouterTache = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    try {
      const currentTasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const newId = currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.id)) + 1 : 1;

      const newTask: Task = {
        id: newId,
        ...task,
        completed: false,
      };

      const updated = [...currentTasks, newTask];
      setStorageData(StorageKeys.TASKS, updated);
      setTasks(updated);
      console.log(`✓ Tâche #${newId} ajoutée: "${task.title}"`);
    } catch (e) {
      console.error('Erreur ajout tâche:', e);
    }
  }, []);

  // --- TÂCHE: Basculer complétude d'une tâche ---
  const basculeCompletionTache = useCallback((id: number) => {
    try {
      const currentTasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const task = currentTasks.find(t => t.id === id);
      if (!task) {
        console.warn(`Tâche #${id} non trouvée`);
        return;
      }

      task.completed = !task.completed;
      setStorageData(StorageKeys.TASKS, currentTasks);
      setTasks([...currentTasks]);
      console.log(`✓ Tâche #${id} basculée: ${task.completed ? 'complétée' : 'incomplète'}`);
    } catch (e) {
      console.error('Erreur bascule tâche:', e);
    }
  }, []);

  // --- TÂCHE: Supprimer une tâche ---
  const supprimerTache = useCallback((id: number) => {
    try {
      const currentTasks = getStorageData<Task[]>(StorageKeys.TASKS, []);
      const updated = currentTasks.filter(t => t.id !== id);
      setStorageData(StorageKeys.TASKS, updated);
      setTasks(updated);
      console.log(`✓ Tâche #${id} supprimée`);
    } catch (e) {
      console.error('Erreur suppression tâche:', e);
    }
  }, []);

  // --- OBJECTIF: Charger tous les objectifs ---
  const obtenirObjectifs = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      setGoals(data);
      console.log(`✓ ${data.length} objectifs chargés`);
    } catch (e) {
      console.error('Erreur chargement objectifs:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- OBJECTIF: Ajouter un nouvel objectif ---
  const ajouterObjectif = useCallback((goal: Omit<Goal, 'id' | 'contributions' | 'current_amount' | 'status' | 'created_at'>) => {
    try {
      const currentGoals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const newId = currentGoals.length > 0 ? Math.max(...currentGoals.map(g => g.id)) + 1 : 1;

      const newGoal: Goal = {
        id: newId,
        ...goal,
        current_amount: 0,
        contributions: [],
        status: 'active',
        created_at: new Date().toISOString(),
        priority: goal.priority || 'medium',
        color: goal.color || '#7C3AED',
      };

      const updated = [...currentGoals, newGoal];
      setStorageData(StorageKeys.GOALS, updated);
      setGoals(updated);
      console.log(`✓ Objectif #${newId} ajouté: "${goal.title}"`);
    } catch (e) {
      console.error('Erreur ajout objectif:', e);
    }
  }, []);

  // --- OBJECTIF: Supprimer un objectif ---
  const supprimerObjectif = useCallback((id: number) => {
    try {
      const currentGoals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const updated = currentGoals.filter(g => g.id !== id);
      setStorageData(StorageKeys.GOALS, updated);
      setGoals(updated);
      console.log(`✓ Objectif #${id} supprimé`);
    } catch (e) {
      console.error('Erreur suppression objectif:', e);
    }
  }, []);

  // --- OBJECTIF: Ajouter une contribution ---
  const ajouterContributionObjectif = useCallback((goalId: number, amount: number) => {
    try {
      const currentGoals = getStorageData<Goal[]>(StorageKeys.GOALS, []);
      const goal = currentGoals.find(g => g.id === goalId);
      if (!goal) {
        console.warn(`Objectif #${goalId} non trouvé`);
        return;
      }

      goal.current_amount += amount;
      if (!goal.contributions) goal.contributions = [];
      
      goal.contributions.push({
        id: goal.contributions.length + 1,
        goal_id: goalId,
        amount,
        date: new Date().toISOString().split('T')[0],
      });

      setStorageData(StorageKeys.GOALS, currentGoals);
      setGoals([...currentGoals]);
      console.log(`✓ Contribution +${amount} ajoutée à l'objectif #${goalId}`);
    } catch (e) {
      console.error('Erreur ajout contribution:', e);
    }
  }, []);

  // --- UTILITAIRE: Calculer le bilan financier ---
  const calculerBilan = useCallback(() => {
    return calculateBalance(transactions);
  }, [transactions]);

  // --- UTILITAIRE: Obtenir les stats par catégorie ---
  const obtenirStatsCategories = useCallback(() => {
    return calculateCategoryStats(transactions);
  }, [transactions]);

  const value: DonneesContextType = {
    transactions,
    tasks,
    goals,
    isLoading,
    ajouterTransaction,
    supprimerTransaction,
    obtenirTransactions,
    ajouterTache,
    basculeCompletionTache,
    supprimerTache,
    obtenirTaches,
    ajouterObjectif,
    supprimerObjectif,
    ajouterContributionObjectif,
    obtenirObjectifs,
    calculerBilan,
    obtenirStatsCategories,
  };

  return (
    <DonneesContext.Provider value={value}>
      {children}
    </DonneesContext.Provider>
  );
};
