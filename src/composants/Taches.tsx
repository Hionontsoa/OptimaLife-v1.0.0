/**
 * Écran Tâches - Gestion des Tâches Quotidiennes
 * Permet de créer, compléter, et supprimer des tâches avec rappels et priorités
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bell, Calendar, CheckSquare, Trash2, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDonnees } from './GestionDonnees';
import { Header, Card } from './Composants';
import { createRecurringTask, getRecurrenceLabel, getAllRecurrences } from './GestionRecurrence';

export const Taches: React.FC = () => {
  const { tasks, ajouterTache, basculeCompletionTache, supprimerTache } = useDonnees();
  const [newTask, setNewTask] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showReminderInput, setShowReminderInput] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  // Obtenir toutes les récurrences pour l'affichage
  const recurrences = getAllRecurrences();

  // --- Ajouter une nouvelle tâche ---
  const handleAddTask = () => {
    if (!newTask.trim()) {
      alert('Veuillez entrer une tâche');
      return;
    }
    
    ajouterTache({
      title: newTask,
      priority,
      reminder_time: reminderTime || undefined,
      due_date: dueDate || undefined,
    } as any);

    // Si récurrence, créer la récurrence (après création de la tâche)
    if (recurrencePattern !== 'none') {
      setTimeout(() => {
        const newCreatedTask = tasks.find(t => t.title === newTask);
        if (newCreatedTask) {
          createRecurringTask(newCreatedTask, recurrencePattern as any, recurrenceInterval);
        }
      }, 100);
    }

    // Réinitialiser le formulaire
    setNewTask('');
    setReminderTime('');
    setDueDate('');
    setPriority('medium');
    setRecurrencePattern('none');
    setRecurrenceInterval(1);
    setShowReminderInput(false);
  };

  // --- Basculer l'état d'une tâche ---
  const handleToggleTask = (id: number) => {
    basculeCompletionTache(id);
  };

  // --- Supprimer une tâche ---
  const handleDeleteTask = (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    supprimerTache(id);
  };

  return (
    <div className="pb-24">
      <Header title="Tâches" subtitle="Restez organisé au quotidien" />
      
      <div className="px-6 space-y-4">
        {/* --- Formulaire pour ajouter une tâche --- */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {/* Champ de texte pour la tâche */}
            <input 
              type="text" 
              placeholder="Nouvelle tâche..."
              className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-slate-400"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            />

            {/* Bouton pour toggle les options de rappel */}
            <button 
              onClick={() => setShowReminderInput(!showReminderInput)}
              className={`p-4 rounded-2xl border transition-colors ${
                showReminderInput 
                  ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple' 
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Bell size={24} />
            </button>

            {/* Bouton ajouter tâche */}
            <button 
              onClick={handleAddTask}
              className="bg-brand-purple text-white p-4 rounded-2xl shadow-lg shadow-brand-purple/20 hover:shadow-lg transition-shadow"
            >
              <Plus size={24} />
            </button>
          </div>
          
          {/* --- Panneaux des options de rappel et priorité --- */}
          <AnimatePresence>
            {showReminderInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {/* Date et heure formatée */}
                <div className="flex gap-2">
                  {/* Date d'échéance */}
                  <div className="flex-1 bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <input 
                      type="date" 
                      className="flex-1 bg-transparent focus:outline-none text-sm font-medium text-slate-600"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>

                  {/* Heure de rappel */}
                  <div className="flex-1 bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-2">
                    <Bell size={16} className="text-slate-400" />
                    <input 
                      type="datetime-local" 
                      className="flex-1 bg-transparent focus:outline-none text-sm font-medium text-slate-600"
                      value={reminderTime}
                      onChange={e => setReminderTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* --- Sélection de priorité --- */}
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${
                        priority === p 
                          ? p === 'high' ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : p === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                    </button>
                  ))}
                </div>

                {/* --- Configuration de la récurrence --- */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                    <Repeat size={12} /> Récurrence
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 p-3 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={recurrencePattern}
                    onChange={e => setRecurrencePattern(e.target.value as any)}
                  >
                    <option value="none">Non récurrente</option>
                    <option value="daily">Chaque jour</option>
                    <option value="weekly">Chaque semaine</option>
                    <option value="monthly">Chaque mois</option>
                    <option value="yearly">Chaque année</option>
                  </select>

                  {recurrencePattern !== 'none' && (
                    <input
                      type="number"
                      min="1"
                      placeholder="Intervalle"
                      className="w-full bg-white border border-slate-200 p-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      value={recurrenceInterval}
                      onChange={e => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Liste des tâches --- */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Aucune tâche pour le moment</p>
              <p className="text-xs mt-2">Créez votre première tâche pour commencer !</p>
            </div>
          ) : (
            tasks.map(task => (
              <Card 
                key={task.id} 
                className="p-4 flex items-center gap-4 group relative overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* --- Case à cocher --- */}
                <button 
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    task.completed 
                      ? 'bg-brand-purple border-brand-purple' 
                      : 'border-slate-300 hover:border-brand-purple'
                  }`}
                >
                  {task.completed && (
                    <CheckSquare size={14} className="text-white" />
                  )}
                </button>

                {/* --- Contenu de la tâche --- */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    task.completed 
                      ? 'text-slate-400 line-through' 
                      : 'text-slate-800'
                  }`}>
                    {task.title}
                  </p>

                  {/* --- Métadonnées (date, rappel, priorité) --- */}
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {task.due_date && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> 
                        {format(new Date(task.due_date), 'dd MMM')}
                      </p>
                    )}
                    {task.reminder_time && (
                      <p className="text-[10px] text-brand-cyan font-medium flex items-center gap-1">
                        <Bell size={10} /> 
                        {format(new Date(task.reminder_time), 'dd MMM HH:mm', { locale: fr })}
                      </p>
                    )}
                    {recurrences.some(r => r.task_id === task.id) && (
                      <p className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Repeat size={10} /> 
                        {getRecurrenceLabel(
                          recurrences.find(r => r.task_id === task.id)?.pattern || 'daily',
                          recurrences.find(r => r.task_id === task.id)?.interval || 1
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* --- Indicateur de priorité --- */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  task.priority === 'high' 
                    ? 'bg-rose-500' 
                    : task.priority === 'medium' 
                      ? 'bg-amber-500' 
                      : 'bg-brand-cyan'
                }`} />
                
                {/* --- Bouton de suppression au hover --- */}
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="absolute right-0 top-0 bottom-0 w-12 bg-rose-50 text-rose-500 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
