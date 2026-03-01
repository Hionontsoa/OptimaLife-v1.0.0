/**
 * Gestion de la Récurrence de Tâches
 * Fonctionnalités pour créer des tâches récurrentes (quotidienne, hebdomadaire, mensuelle, annuelle)
 */

import type { Task, TaskRecurrence } from '../types';
import { getStorageData, setStorageData, StorageKeys } from './utilitaires';

/**
 * Créer une tâche récurrente
 * @param task - La tâche de base
 * @param pattern - Le patron de récurrence (daily, weekly, monthly, yearly)
 * @param interval - L'intervalle (ex: chaque 2 jours, chaque 3 semaines)
 * @param endDate - Date de fin de la récurrence (optionnel)
 */
export const createRecurringTask = (
  task: Task,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number = 1,
  endDate?: string
): TaskRecurrence => {
  const recurrences = getStorageData<TaskRecurrence[]>(StorageKeys.TASK_RECURRENCE, []);
  const newId = recurrences.length > 0 ? Math.max(...recurrences.map(r => r.id)) + 1 : 1;

  const nextDue = calculateNextDueDate(task.due_date || new Date().toISOString().split('T')[0], pattern, interval);

  const recurrence: TaskRecurrence = {
    id: newId,
    task_id: task.id,
    pattern,
    interval,
    end_date: endDate,
    next_due: nextDue,
  };

  recurrences.push(recurrence);
  setStorageData(StorageKeys.TASK_RECURRENCE, recurrences);

  return recurrence;
};

/**
 * Calculer la date suivante pour une tâche récurrente
 */
export const calculateNextDueDate = (currentDate: string, pattern: string, interval: number = 1): string => {
  const date = new Date(currentDate);

  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * interval));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + interval);
      break;
    default:
      break;
  }

  return date.toISOString().split('T')[0];
};

/**
 * Obtenir la prochaine tâche récurrente à créer
 */
export const getNextRecurringTasks = (tasks: Task[]): Array<{ task: Task; recurrence: TaskRecurrence }> => {
  const recurrences = getStorageData<TaskRecurrence[]>(StorageKeys.TASK_RECURRENCE, []);
  const today = new Date().toISOString().split('T')[0];
  const results: Array<{ task: Task; recurrence: TaskRecurrence }> = [];

  recurrences.forEach(recurrence => {
    const task = tasks.find(t => t.id === recurrence.task_id);
    if (!task) return;

    // Vérifier si la date d'échéance est passée et que la récurrence n'a pas de date de fin ou que la date de fin n'est pas passée
    if (task.due_date && task.due_date <= today) {
      if (!recurrence.end_date || recurrence.end_date >= today) {
        results.push({ task, recurrence });
      }
    }
  });

  return results;
};

/**
 * Créer la prochaine occurrence d'une tâche récurrente
 */
export const createNextOccurrence = (
  task: Task,
  recurrence: TaskRecurrence,
  createNewTaskFn: (task: Omit<Task, 'id'>) => void
): void => {
  // Créer la nouvelle tâche pour la prochaine date
  const nextDate = calculateNextDueDate(recurrence.next_due || new Date().toISOString().split('T')[0], recurrence.pattern, recurrence.interval);

  createNewTaskFn({
    title: task.title,
    priority: task.priority,
    due_date: nextDate,
    reminder_time: task.reminder_time,
    completed: false,
  });

  // Mettre à jour la date suivante
  const recurrences = getStorageData<TaskRecurrence[]>(StorageKeys.TASK_RECURRENCE, []);
  const updated = recurrences.map(r =>
    r.id === recurrence.id ? { ...r, next_due: nextDate } : r
  );
  setStorageData(StorageKeys.TASK_RECURRENCE, updated);
};

/**
 * Supprimer une récurrence de tâche
 */
export const deleteRecurrence = (recurrenceId: number): void => {
  const recurrences = getStorageData<TaskRecurrence[]>(StorageKeys.TASK_RECURRENCE, []);
  const updated = recurrences.filter(r => r.id !== recurrenceId);
  setStorageData(StorageKeys.TASK_RECURRENCE, updated);
};

/**
 * Obtenir toutes les récurrences de tâches
 */
export const getAllRecurrences = (): TaskRecurrence[] => {
  return getStorageData<TaskRecurrence[]>(StorageKeys.TASK_RECURRENCE, []);
};

/**
 * Afficher un label humain pour une récurrence
 */
export const getRecurrenceLabel = (pattern: string, interval: number): string => {
  if (interval === 1) {
    switch (pattern) {
      case 'daily':
        return 'Chaque jour';
      case 'weekly':
        return 'Chaque semaine';
      case 'monthly':
        return 'Chaque mois';
      case 'yearly':
        return 'Chaque année';
      default:
        return 'Récurrente';
    }
  } else {
    switch (pattern) {
      case 'daily':
        return `Tous les ${interval} jours`;
      case 'weekly':
        return `Toutes les ${interval} semaines`;
      case 'monthly':
        return `Tous les ${interval} mois`;
      case 'yearly':
        return `Tous les ${interval} ans`;
      default:
        return 'Récurrente';
    }
  }
};
