/**
 * Utilitaires de Sauvegarde et Synchronisation
 * Gestion automatique des sauvegardes et des rappels de l'application
 */

import { StorageKeys, getStorageData, setStorageData } from './utilitaires';
import { performAutoBackup } from './AnalysesUtilitaires';
import type { Goal, Task } from '../types';
import { generateReminders } from './AnalysesUtilitaires';

// --- 1. Initialiser la sauvegarde automatique ---
export const initializeAutoBackup = (intervalMinutes: number = 5) => {
  const backupInterval = setInterval(() => {
    performAutoBackup();
    console.log(`✓ Sauvegarde automatique effectuée à ${new Date().toLocaleTimeString('fr-FR')}`);
  }, intervalMinutes * 60 * 1000);

  return backupInterval;
};

// --- 2. Restaurer une sauvegarde ---
export const restoreBackup = (backupData: any) => {
  if (!backupData || !backupData.transactions) {
    console.error('Sauvegarde invalide');
    return false;
  }

  try {
    setStorageData('zen_transactions', backupData.transactions || []);
    setStorageData('zen_tasks', backupData.tasks || []);
    setStorageData('zen_goals', backupData.goals || []);
    console.log('✓ Sauvegarde restaurée avec succès');
    return true;
  } catch (e) {
    console.error('Erreur lors de la restauration:', e);
    return false;
  }
};

// --- 3. Obtenir la date de la dernière sauvegarde ---
export const getLastBackupDate = (): Date | null => {
  const lastBackup = getStorageData<string | null>(StorageKeys.LAST_BACKUP, '');
  return lastBackup ? new Date(lastBackup) : null;
};

// --- 4. Vérifier la santé des données ---
export const checkDataIntegrity = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    const transactions = getStorageData<any[]>('zen_transactions', []);
    const tasks = getStorageData<any[]>('zen_tasks', []);
    const goals = getStorageData<any[]>('zen_goals', []);

    // Vérifier les transactions
    transactions.forEach((tx, idx) => {
      if (!tx.id || !tx.amount || !tx.type) {
        errors.push(`Transaction ${idx} invalide`);
      }
    });

    // Vérifier les tâches
    tasks.forEach((task, idx) => {
      if (!task.id || !task.title) {
        errors.push(`Tâche ${idx} invalide`);
      }
    });

    // Vérifier les objectifs
    goals.forEach((goal, idx) => {
      if (!goal.id || !goal.title || goal.target_amount === undefined) {
        errors.push(`Objectif ${idx} invalide`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (e) {
    return {
      isValid: false,
      errors: ['Erreur lors de la vérification des données'],
    };
  }
};

// --- 5. Générer un rapport de santé ---
export const generateHealthReport = (tasks: Task[], goals: Goal[]): any => {
  const integrity = checkDataIntegrity();
  const lastBackup = getLastBackupDate();

  return {
    timestamp: new Date().toISOString(),
    dataIntegrity: integrity,
    tasksCount: tasks.length,
    goalsCount: goals.length,
    lastBackupDate: lastBackup?.toISOString() || 'Jamais',
    overallHealth: integrity.isValid ? 'Bon' : 'Problèmes détectés',
  };
};

// --- 6. Nettoyer les anciennes données ---
export const cleanupOldData = (daysOld: number = 90) => {
  const transactions = getStorageData<any[]>('zen_transactions', []);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const filtered = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate > cutoffDate;
  });

  setStorageData('zen_transactions', filtered);
  console.log(`✓ ${transactions.length - filtered.length} anciennes transactions supprimées`);

  return filtered;
};

// --- 7. Exporter les rappels ---
export const exportReminders = (tasks: Task[], goals: Goal[]): Array<{ type: string; title: string; date: string; priority: string }> => {
  const reminders = generateReminders(tasks, goals);
  return reminders.map(r => ({
    ...r,
    date: r.dueDate,
  }));
};

// --- 8. Vérifier les tâches expirées ---
export const getExpiredTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter(task => {
    if (task.completed || !task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  });
};

// --- 9. Vérifier les objectifs proches de l'échéance ---
export const getNearDeadlineGoals = (goals: Goal[]): Goal[] => {
  const today = new Date();
  const inThirtyDays = new Date();
  inThirtyDays.setDate(inThirtyDays.getDate() + 30);

  return goals.filter(goal => {
    if (goal.status !== 'active' || !goal.deadline) return false;
    const deadline = new Date(goal.deadline);
    return deadline > today && deadline < inThirtyDays;
  });
};

// --- 10. Obtenir les statistiques de santé globales ---
export const getHealthMetrics = (tasks: Task[], goals: Goal[], transactions: any[]): any => {
  const expiredTasks = getExpiredTasks(tasks);
  const nearDeadlineGoals = getNeaDeadlineGoals(goals);
  const integrity = checkDataIntegrity();

  return {
    issues: {
      expiredTasks: expiredTasks.length,
      nearDeadlineGoals: nearDeadlineGoals.length,
      dataErrors: integrity.errors.length,
    },
    summary: {
      totalTasks: tasks.length,
      totalGoals: goals.length,
      totalTransactions: transactions.length,
      completedTasks: tasks.filter(t => t.completed).length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
    },
    recommendations: generateRecommendations(tasks, goals, expiredTasks, nearDeadlineGoals),
  };
};

// --- Fonction auxiliaire pour les recommandations ---
const generateRecommendations = (
  tasks: Task[],
  goals: Goal[],
  expiredTasks: Task[],
  nearDeadlineGoals: Goal[]
): string[] => {
  const recommendations: string[] = [];

  if (expiredTasks.length > 0) {
    recommendations.push(`Vous avez ${expiredTasks.length} tâche(s) expirée(s) à compléter ou à archiver`);
  }

  if (nearDeadlineGoals.length > 0) {
    recommendations.push(`${nearDeadlineGoals.length} objectif(s) arrivent à échéance dans les 30 prochains jours`);
  }

  if (tasks.length === 0 && goals.length === 0) {
    recommendations.push('Commencez par créer vos premières tâches et objectifs');
  }

  const completionRate = tasks.length > 0 ? tasks.filter(t => t.completed).length / tasks.length : 0;
  if (completionRate > 0.8) {
    recommendations.push('Excellente productivité ! Continuez ainsi !');
  }

  return recommendations;
};

// Fonction auxiliaire
function getNeaDeadlineGoals(goals: Goal[]): Goal[] {
  const today = new Date();
  const inThirtyDays = new Date();
  inThirtyDays.setDate(inThirtyDays.getDate() + 30);

  return goals.filter(goal => {
    if (goal.status !== 'active' || !goal.deadline) return false;
    const deadline = new Date(goal.deadline);
    return deadline > today && deadline < inThirtyDays;
  });
}
