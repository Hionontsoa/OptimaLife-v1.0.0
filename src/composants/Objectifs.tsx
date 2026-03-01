/**
 * Écran Objectifs - Suivi des Objectifs Financiers
 * Permet de créer et suivre les objectifs avec contributions et progress tracking
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trash2, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from './contexte';
import { useDonnees } from './GestionDonnees';
import { ICONS } from '../types';
import { Header, Card } from './Composants';

export const Objectifs: React.FC = () => {
  const { currency } = useCurrency();
  const { goals, ajouterObjectif, supprimerObjectif, ajouterContributionObjectif } = useDonnees();
  
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    target_amount: '', 
    deadline: '', 
    icon: 'Target' 
  });

  const goalIcons = ['Target', 'Wallet', 'Home', 'Car', 'GraduationCap', 'HeartPulse', 'ShoppingBag', 'Gamepad', 'Briefcase', 'TrendingUp'];

  // --- Supprimer un objectif ---
  const handleDeleteGoal = (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return;
    supprimerObjectif(id);
    setSelectedGoal(null);
  };

  // --- Charger les détails d'un objectif ---
  const handleGoalClick = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
    }
  };

  // --- Ajouter une contribution ---
  const handleContribute = () => {
    if (!selectedGoal || !contributionAmount || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const amount = parseFloat(contributionAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        setIsSubmitting(false);
        return;
      }
      ajouterContributionObjectif(selectedGoal.id, amount);
      setContributionAmount('');
      // Mettre à jour selectedGoal avec la version actualisée après un court délai
      setTimeout(() => {
        const updatedGoal = goals.find(g => g.id === selectedGoal.id);
        if (updatedGoal) {
          setSelectedGoal(updatedGoal);
        }
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Créer un nouvel objectif ---
  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const targetAmount = parseFloat(newGoal.target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Le montant cible doit être un nombre positif');
      return;
    }
    
    ajouterObjectif({
      title: newGoal.title,
      target_amount: targetAmount,
      deadline: newGoal.deadline,
      icon: newGoal.icon,
    });

    setShowCreateModal(false);
    setNewGoal({ title: '', target_amount: '', deadline: '', icon: 'Target' });
  };

  return (
    <div className="pb-24">
      <Header title="Objectifs" subtitle="Suivez vos rêves financiers" />
      
      <div className="px-6 space-y-4">
        {/* --- Liste des objectifs --- */}
        {goals.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Aucun objectif créé pour le moment</p>
            <p className="text-xs mt-2">Créez votre premier objectif pour commencer à économiser !</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isNearTarget = progress >= 90 && progress < 100;
            const Icon = (ICONS as any)[goal.icon] || Target;
            
            return (
              <Card 
                key={goal.id} 
                className="cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
                onClick={() => handleGoalClick(goal.id)}
              >
                {/* --- Header de l'objectif --- */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 flex-1">
                    {/* --- Icône --- */}
                    <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>

                    {/* --- Titre et badges --- */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{goal.title}</h3>
                        
                        {/* --- Badge "Presque là!" --- */}
                        {isNearTarget && (
                          <motion.span 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm shadow-amber-100 whitespace-nowrap"
                          >
                            <AlertCircle size={10} /> Presque là !
                          </motion.span>
                        )}

                        {/* --- Badge "Complété" --- */}
                        {progress >= 100 && (
                          <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            ✓ Complété
                          </span>
                        )}
                      </div>

                      {/* --- Échéance --- */}
                      <p className="text-slate-400 text-xs">
                        Échéance : {goal.deadline 
                          ? format(new Date(goal.deadline), 'dd MMM yyyy') 
                          : 'Non définie'}
                      </p>
                    </div>
                  </div>

                  {/* --- Pourcentage --- */}
                  <div className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-lg text-[10px] font-bold shrink-0">
                    {Math.round(progress)}%
                  </div>
                </div>
                
                {/* --- Barre de progression --- */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className={`h-full rounded-full ${
                      progress >= 100 
                        ? 'bg-emerald-500' 
                        : isNearTarget 
                          ? 'bg-amber-500' 
                          : 'bg-brand-purple'
                    }`}
                  />
                </div>
                
                {/* --- Montants --- */}
                <div className="flex justify-between text-sm">
                  <p className="font-bold text-slate-800">
                    {goal.current_amount.toLocaleString('fr-FR')} {currency}
                  </p>
                  <p className="text-slate-400">
                    Cible : {goal.target_amount.toLocaleString('fr-FR')} {currency}
                  </p>
                </div>
              </Card>
            );
          })
        )}

        {/* --- Bouton pour créer un nouvel objectif --- */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full border-2 border-dashed border-slate-200 p-6 rounded-2xl text-slate-400 font-medium flex flex-col items-center gap-2 hover:border-slate-300 hover:text-slate-500 transition-colors"
        >
          <Target size={32} strokeWidth={1.5} />
          Créer un nouvel objectif
        </button>
      </div>

      {/* --- Modal de création d'objectif --- */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full rounded-t-4xl p-8 pb-12"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Nouvel objectif</h3>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                {/* --- Titre --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                    Titre
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Voyage au Japon"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>

                {/* --- Montant cible --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                    Montant cible ({currency})
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="2000"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newGoal.target_amount}
                    onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  />
                </div>

                {/* --- Échéance --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                    Échéance
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>

                {/* --- Sélection icône --- */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                    Icône
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {goalIcons.map(iconName => {
                      const Icon = (ICONS as any)[iconName];
                      return (
                        <button
                          key={iconName}
                          onClick={() => setNewGoal({ ...newGoal, icon: iconName })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            newGoal.icon === iconName 
                              ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* --- Bouton créer --- */}
                <button 
                  onClick={handleCreateGoal}
                  className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-brand-purple/20 hover:shadow-lg transition-shadow"
                >
                  Créer l'objectif
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modal de détails et contribution --- */}
      <AnimatePresence>
        {selectedGoal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-60 flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full rounded-t-4xl p-8 pb-12 max-h-screen overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{selectedGoal.title}</h3>
                <div className="flex items-center gap-4">
                  {/* Bouton supprimer */}
                  <button 
                    onClick={() => handleDeleteGoal(selectedGoal.id)}
                    className="text-rose-500 bg-rose-50 p-2 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  {/* Bouton fermer */}
                  <button 
                    onClick={() => setSelectedGoal(null)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* --- Aperçu de la progression --- */}
                <div className="bg-slate-50 p-6 rounded-2xl text-center">
                  <p className="text-slate-500 text-sm mb-1">Progression actuelle</p>
                  <h4 className="text-3xl font-bold text-brand-purple">
                    {Math.round((selectedGoal.current_amount / selectedGoal.target_amount) * 100)}%
                  </h4>
                  <p className="text-slate-400 text-xs mt-2">
                    {selectedGoal.current_amount.toLocaleString('fr-FR')} {currency} sur{' '}
                    {selectedGoal.target_amount.toLocaleString('fr-FR')} {currency}
                  </p>
                </div>

                {/* --- Formulaire de contribution --- */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Ajouter une contribution</h4>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder={`Montant ${currency}`}
                      className="flex-1 bg-slate-100 p-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      value={contributionAmount}
                      onChange={e => setContributionAmount(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handleContribute}
                      disabled={isSubmitting}
                      className="bg-brand-purple text-white px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                    >
                      {isSubmitting ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </div>

                {/* --- Historique des contributions --- */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800">Historique des contributions</h4>
                  <div className="space-y-2">
                    {selectedGoal.contributions && selectedGoal.contributions.length > 0 ? (
                      selectedGoal.contributions.map(c => (
                        <div 
                          key={c.id} 
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              +{c.amount} {currency}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {format(new Date(c.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                            <Plus size={14} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 text-sm py-4 italic">
                        Aucune contribution pour le moment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
