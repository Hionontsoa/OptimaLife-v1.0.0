/**
 * Gestion des Budgets - Configuration et suivi des limites budgétaires
 * Permet de définir des budgets par catégorie et recevoir des alertes
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Edit2, Save, X } from 'lucide-react';
import { getStorageData, setStorageData, StorageKeys, INITIAL_CATEGORIES } from './utilitaires';
import { useCurrency } from './contexte';
import { useDonnees } from './GestionDonnees';
import { Card } from './Composants';
import { checkBudgetAlerts } from './AnalysesUtilitaires';

interface BudgetItem {
  categoryId: number;
  categoryName: string;
  limit: number;
  alertThreshold: number;
}

export const GestionBudgets: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currency } = useCurrency();
  const { transactions } = useDonnees();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ limit: string; threshold: string }>({ limit: '', threshold: '' });

  React.useEffect(() => {
    const savedBudgets = getStorageData<Record<number, number>>(StorageKeys.BUDGET_LIMITS, {});
    const budgetItems: BudgetItem[] = INITIAL_CATEGORIES
      .filter(c => c.type === 'expense')
      .map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        limit: savedBudgets[cat.id] || 0,
        alertThreshold: Math.floor((savedBudgets[cat.id] || 0) * 0.8),
      }));
    setBudgets(budgetItems);
  }, [isOpen]);

  const handleSave = () => {
    const budgetLimits: Record<number, number> = {};
    budgets.forEach(b => {
      if (b.limit > 0) {
        budgetLimits[b.categoryId] = b.limit;
      }
    });
    setStorageData(StorageKeys.BUDGET_LIMITS, budgetLimits);
    onClose();
  };

  const handleEdit = (categoryId: number, limit: number) => {
    setEditingId(categoryId);
    setEditValues({ limit: limit.toString(), threshold: (limit * 0.8).toString() });
  };

  const handleUpdateBudget = (categoryId: number) => {
    setBudgets(budgets.map(b => 
      b.categoryId === categoryId 
        ? { ...b, limit: parseFloat(editValues.limit), alertThreshold: parseFloat(editValues.threshold) }
        : b
    ));
    setEditingId(null);
  };

  const budgetAlerts = checkBudgetAlerts(transactions, Object.fromEntries(budgets.map(b => [b.categoryId, b.limit])));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-60 flex items-end"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="bg-white w-full rounded-t-4xl p-8 pb-12 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Gestion des budgets</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          {/* --- Alertes actives --- */}
          {budgetAlerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {budgetAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{alert.categoryName}</p>
                    <p className="text-xs text-slate-600">{alert.spent.toFixed(2)} / {alert.limit.toFixed(2)} {currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Liste des budgets --- */}
          <div className="space-y-3">
            {budgets.map(budget => (
              <Card key={budget.categoryId}>
                {editingId === budget.categoryId ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Limite mensuelle"
                      className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm"
                      value={editValues.limit}
                      onChange={e => setEditValues({ ...editValues, limit: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Seuil d'alerte"
                      className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm"
                      value={editValues.threshold}
                      onChange={e => setEditValues({ ...editValues, threshold: e.target.value })}
                    />
                    <button
                      onClick={() => handleUpdateBudget(budget.categoryId)}
                      className="w-full bg-brand-purple text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> Enregistrer
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{budget.categoryName}</p>
                      <p className="text-sm text-slate-600">
                        Limite: {budget.limit.toFixed(2)} {currency}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(budget.categoryId, budget.limit)}
                      className="text-brand-purple hover:bg-brand-purple/10 p-2 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 bg-brand-purple text-white py-3 rounded-xl font-bold"
          >
            Enregistrer tous les budgets
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
