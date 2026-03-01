/**
 * Écran Rapports - Analyses et Statistiques Détaillées
 * Affiche les rapports mensuels, tendances, alertes budgétaires et statistiques
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, FileJson } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrency } from './contexte';
import { useDonnees } from './GestionDonnees';
import { Header, Card } from './Composants';
import {
  checkBudgetAlerts,
  calculateGoalStats,
  calculateTaskStats,
  analyzeWeeklyData,
  generateMonthlyReport,
  exportToCSV,
  exportToJSON,
  detectOutliersExpenses,
  projectFutureBalance,
} from './AnalysesUtilitaires';
import { getStorageData, StorageKeys } from './utilitaires';

export const Rapports: React.FC = () => {
  const { currency } = useCurrency();
  const { transactions, goals, tasks } = useDonnees();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts' | 'export'>('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

  // --- CALCULS ---
  const budgetLimits = getStorageData<Record<number, number>>(StorageKeys.BUDGET_LIMITS, {});
  const alerts = checkBudgetAlerts(transactions, budgetLimits);
  const goalStats = calculateGoalStats(goals);
  const taskStats = calculateTaskStats(tasks);
  const weeklyData = analyzeWeeklyData(transactions);
  const monthlyReport = generateMonthlyReport(transactions, selectedMonth);
  const outliers = detectOutliersExpenses(transactions);
  const projections = projectFutureBalance(transactions);

  // --- EXPORT ---
  const handleExportCSV = () => {
    exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportJSON = () => {
    const data = { transactions, goals, tasks, backup_date: new Date().toISOString() };
    exportToJSON(data, `backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="pb-24">
      <Header title="Rapports" subtitle="Analyses et Statistiques" />

      <div className="px-6 space-y-4">
        {/* --- Onglets de navigation --- */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble' },
            { id: 'trends', label: '📈 Tendances' },
            { id: 'alerts', label: '⚠️ Alertes' },
            { id: 'export', label: '💾 Export' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- 1. VUE D'ENSEMBLE --- */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Statistiques d'objectifs */}
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">🎯 Statistiques d'Objectifs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-purple/10 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">Complétés</p>
                  <p className="text-2xl font-bold text-brand-purple">{goalStats.completed}</p>
                </div>
                <div className="bg-amber-100 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">En cours</p>
                  <p className="text-2xl font-bold text-amber-600">{goalStats.active}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">Progression moyenne</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-purple h-full" style={{ width: `${Math.min(goalStats.averageProgress, 100)}%` }} />
                    </div>
                    <p className="font-bold text-slate-800">{Math.round(goalStats.averageProgress)}%</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistiques de productivité */}
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">✅ Productivité</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-100 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">Complétées</p>
                  <p className="text-2xl font-bold text-emerald-600">{taskStats.completed}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">{taskStats.pending}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase">Taux de complétude</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(taskStats.completionRate, 100)}%` }} />
                    </div>
                    <p className="font-bold text-slate-800">{Math.round(taskStats.completionRate)}%</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rapport du mois */}
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">📅 Rapport du mois</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="flex-1 bg-slate-50 p-2 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500">Revenus</p>
                  <p className="font-bold text-green-600">{monthlyReport.summary.income.toFixed(2)} {currency}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500">Dépenses</p>
                  <p className="font-bold text-red-600">{monthlyReport.summary.expense.toFixed(2)} {currency}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500">Solde</p>
                  <p className={`font-bold ${monthlyReport.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyReport.summary.balance.toFixed(2)} {currency}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* --- 2. TENDANCES --- */}
        {activeTab === 'trends' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">📊 Tendances hebdomadaires</h3>
              {weeklyData.length > 0 ? (
                <div className="space-y-3">
                  {weeklyData.slice(-4).map((week, idx) => (
                    <div key={idx} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{format(new Date(week.week), 'dd MMM', { locale: fr })}</p>
                        <div className="flex gap-2 mt-1 text-[10px]">
                          <span className="text-green-600">+{week.income.toFixed(0)} {currency}</span>
                          <span className="text-red-600">-{week.expense.toFixed(0)} {currency}</span>
                        </div>
                      </div>
                      <div className={`font-bold ${week.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {week.balance.toFixed(0)} {currency}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">Pas de données</p>
              )}
            </Card>

            {/* Projections futures */}
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">🔮 Projections futures</h3>
              {projections.length > 0 ? (
                <div className="space-y-2">
                  {projections.map((proj, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">{proj.month}</p>
                      <p className={`font-bold ${proj.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {proj.projectedBalance.toFixed(0)} {currency}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">Données insuffisantes</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* --- 3. ALERTES --- */}
        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <Card key={idx} className="border-l-4 border-l-amber-400 bg-amber-50">
                  <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{alert.categoryName}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {alert.spent.toFixed(2)} {currency} / {alert.limit.toFixed(2)} {currency}
                      </p>
                      <div className="mt-2 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${Math.min(alert.percentage, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{Math.round(alert.percentage)}% du budget</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <p className="text-slate-400">✓ Tous les budgets sont à jour</p>
              </Card>
            )}

            {/* Dépenses anormales */}
            {outliers.length > 0 && (
              <Card>
                <h3 className="text-sm font-bold text-slate-800 mb-4">🚨 Dépenses anormales détectées</h3>
                <div className="space-y-2">
                  {outliers.slice(0, 5).map((outlier, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{outlier.description}</p>
                        <p className="text-[10px] text-slate-500">{format(new Date(outlier.date), 'dd MMM yyyy')}</p>
                      </div>
                      <p className="font-bold text-red-600">{outlier.amount.toFixed(2)} {currency}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* --- 4. EXPORT --- */}
        {activeTab === 'export' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">💾 Exporter vos données</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <BarChart3 size={24} className="text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800">Exporter en CSV</p>
                    <p className="text-sm text-slate-500">Transactions au format CSV</p>
                  </div>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  <FileJson size={24} className="text-green-600" />
                  <div className="text-left">
                    <p className="font-bold text-slate-800">Sauvegarde complète</p>
                    <p className="text-sm text-slate-500">Toutes les données en JSON</p>
                  </div>
                </button>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-slate-800 mb-4">ℹ️ Informations</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📊 Transactions: <span className="font-bold">{transactions.length}</span></p>
                <p>✅ Tâches: <span className="font-bold">{tasks.length}</span></p>
                <p>🎯 Objectifs: <span className="font-bold">{goals.length}</span></p>
                <p>📅 Dernière mise à jour: <span className="font-bold">{format(new Date(), 'dd MMM yyyy HH:mm')}</span></p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
