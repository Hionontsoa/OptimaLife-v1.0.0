/**
 * Écran Finances - Gestion des Transactions
 * Permet d'ajouter, voir et supprimer les transactions (revenus et dépenses)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertCircle, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { INITIAL_CATEGORIES, getStorageData, StorageKeys } from './utilitaires';
import { useCurrency } from './contexte';
import { useDonnees } from './GestionDonnees';
import { Header, Card, TransactionIcon } from './Composants';
import { GestionBudgets } from './GestionBudgets';
import { checkBudgetAlerts } from './AnalysesUtilitaires';

const Finances: React.FC = () => {
  const { currency } = useCurrency();
  const { transactions, obtenirStatsCategories, ajouterTransaction, supprimerTransaction } = useDonnees();
  const [showAdd, setShowAdd] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [newTx, setNewTx] = useState({ 
    amount: '', 
    category_id: '2', 
    description: '', 
    type: 'expense' as 'expense' | 'income',
    date: new Date().toISOString().split('T')[0]
  });

  // Calculer les stats par catégorie en temps réel depuis les transactions actives
  const categoryStats = obtenirStatsCategories();
  
  // Vérifier les alertes budgétaires
  const budgetLimits = getStorageData<Record<number, number>>(StorageKeys.BUDGET_LIMITS, {});
  const budgetAlerts = checkBudgetAlerts(transactions, budgetLimits);

  // --- Supprimer une transaction ---
  const handleDeleteTransaction = (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return;
    supprimerTransaction(id);
  };

  // --- Ajouter une nouvelle transaction ---
  const handleAdd = () => {
    if (!newTx.amount || !newTx.category_id) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    // Ajouter la transaction via le contexte
    ajouterTransaction({
      amount: parseFloat(newTx.amount),
      category_id: parseInt(newTx.category_id),
      description: newTx.description,
      type: newTx.type,
      date: newTx.date,
    } as any);

    // Réinitialiser le formulaire
    setShowAdd(false);
    const defaultCategoryId = newTx.type === 'income' ? '6' : '2';
    setNewTx({ 
      amount: '', 
      category_id: defaultCategoryId, 
      description: '', 
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="pb-24">
      <Header title="Finances" subtitle="Gérez vos revenus et dépenses" />
      
      <div className="px-6 space-y-4">
        {/* --- Alertes budgétaires --- */}
        {budgetAlerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {budgetAlerts.map((alert, idx) => (
              <Card key={idx} className="border-l-4 border-l-amber-400 bg-amber-50 p-4">
                <div className="flex gap-3 items-start">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{alert.categoryName}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {alert.spent.toFixed(2)} {currency} dépensé sur {alert.limit.toFixed(2)} {currency}
                    </p>
                    <div className="mt-2 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${Math.min(alert.percentage, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* --- Bouton Gérer les budgets --- */}
        <button 
          onClick={() => setShowBudgets(true)}
          className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <Settings size={18} /> Configurer les budgets
        </button>
        {/* --- Camembert des dépenses par catégorie --- */}
        {categoryStats && categoryStats.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Dépenses par catégorie
            </h3>
            <div className="h-48 w-full flex items-center">
              {/* Camembert */}
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Légende */}
              <div className="w-1/2 space-y-2">
                {categoryStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: stat.color }} 
                    />
                    <p className="text-[10px] font-medium text-slate-600 truncate flex-1">
                      {stat.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-800">
                      {stat.value} {currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* --- Bouton pour ajouter une transaction --- */}
        <button 
          onClick={() => setShowAdd(true)}
          className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/20 hover:shadow-lg transition-shadow"
        >
          <Plus size={20} /> Nouvelle Transaction
        </button>

        {/* --- Liste des transactions --- */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Aucune transaction pour le moment</p>
            </div>
          ) : (
            <>
              {(showAllTransactions ? transactions : transactions.slice(-4))
                .reverse()
                .map(t => (
                <Card 
                  key={t.id} 
                  className="p-4 flex items-center justify-between group relative overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <TransactionIcon 
                      iconName={t.category_icon} 
                      color={t.category_color} 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">
                        {t.description || t.category_name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {t.category_name} • {format(new Date(t.date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount} {currency}
                    </p>
                  </div>

                  {/* --- Bouton de suppression au hover --- */}
                  <button 
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="absolute right-0 top-0 bottom-0 w-12 bg-rose-50 text-rose-500 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform"
                  >
                    <Trash2 size={18} />
                  </button>
                </Card>
              ))}
              
              {/* --- Bouton Afficher plus --- */}
              {transactions.length > 4 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="w-full py-3 mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {showAllTransactions ? '▼ Afficher moins' : '▲ Afficher plus'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Modal pour ajouter une transaction --- */}
      <AnimatePresence>
        {showAdd && (
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
                <h3 className="text-xl font-bold">Ajouter une transaction</h3>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-4">
                {/* --- Boutons type (dépense/revenu) --- */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setNewTx({ ...newTx, type: 'expense', category_id: '2' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      newTx.type === 'expense' 
                        ? 'bg-white shadow-sm text-rose-600' 
                        : 'text-slate-500'
                    }`}
                  >
                    Dépense
                  </button>
                  <button 
                    onClick={() => setNewTx({ ...newTx, type: 'income', category_id: '6' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      newTx.type === 'income' 
                        ? 'bg-white shadow-sm text-emerald-600' 
                        : 'text-slate-500'
                    }`}
                  >
                    Revenu
                  </button>
                </div>

                {/* --- Montant --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Montant ({currency})
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Entrez le montant"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newTx.amount}
                    onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                  />
                </div>

                {/* --- Catégorie --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Catégorie
                  </label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newTx.category_id}
                    onChange={e => setNewTx({ ...newTx, category_id: e.target.value })}
                  >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {INITIAL_CATEGORIES
                      .filter(cat => cat.type === newTx.type)
                      .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* --- Description --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Description
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Déjeuner au restaurant"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newTx.description}
                    onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  />
                </div>

                {/* --- Date --- */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    value={newTx.date}
                    onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  />
                </div>

                {/* --- Bouton ajouter --- */}
                <button 
                  onClick={handleAdd}
                  className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 hover:shadow-lg transition-shadow mt-4"
                >
                  Ajouter la transaction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modale de gestion des budgets --- */}
      <GestionBudgets isOpen={showBudgets} onClose={() => setShowBudgets(false)} />
    </div>
  );
};

export { Finances };
