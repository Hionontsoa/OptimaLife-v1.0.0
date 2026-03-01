/**
 * Écran Accueil - Tableau de Bord Principal
 * Affiche un résumé financier avec balance, revenus, dépenses et graphique d'activité
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateActivityData } from './utilitaires';
import { useCurrency } from './contexte';
import { useDonnees } from './GestionDonnees';
import { Header, Card, TransactionIcon } from './Composants';

export const Accueil: React.FC = () => {
  const { currency } = useCurrency();
  const { transactions, calculerBilan } = useDonnees();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week'); 
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Calculer le bilan financier en temps réel
  const bilan = useMemo(() => calculerBilan(), [transactions]);

  // Générer les données d'activité en temps réel
  const activityData = useMemo(() => generateActivityData(transactions, period), [transactions, period]);

  // Obtenir les dernières transactions (3 par défaut, ou toutes si showAllTransactions = true)
  const recentTransactions = useMemo(
    () => {
      const sorted = transactions.slice().reverse();
      return showAllTransactions ? sorted : sorted.slice(0, 3);
    },
    [transactions, showAllTransactions]
  );


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      <Header 
        title="OptimaLife" 
        subtitle="Bienvenue dans votre gestionnaire personnel" 
      />
      
      <div className="px-6 space-y-4">
        {/* --- Carte de solde principal --- */}
        <Card className="bg-linear-to-br from-brand-magenta via-brand-purple to-brand-cyan text-white border-none shadow-lg shadow-brand-purple/20">
          <p className="text-white/80 text-sm font-medium">Solde Total</p>
          <h2 className="text-3xl font-bold mt-1">
            {bilan.balance.toLocaleString('fr-FR')} {currency}
          </h2>
          
          <div className="flex gap-4 mt-6">
            {/* --- Affichage des revenus --- */}
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <ArrowUpCircle size={16} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider">
                  Revenus
                </p>
                <p className="font-semibold">
                  +{bilan.income.toLocaleString('fr-FR')} {currency}
                </p>
              </div>
            </div>

            {/* --- Affichage des dépenses --- */}
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <ArrowDownCircle size={16} className="text-rose-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider">
                  Dépenses
                </p>
                <p className="font-semibold">
                  -{bilan.expenses.toLocaleString('fr-FR')} {currency}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* --- Graphique d'activité --- */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Activité
            </h3>

            {/* --- Boutons pour changer la période --- */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    period === p 
                      ? 'bg-white text-brand-purple shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
          </div>
          
          {/* --- Graphique en aires revenu vs dépense --- */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  {/* Dégradé pour les revenus */}
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>

                  {/* Dégradé pour les dépenses */}
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  minTickGap={20}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />

                {/* Courbe revenus */}
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  name="Revenus"
                />

                {/* Courbe dépenses */}
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  name="Dépenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* --- Légende --- */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Revenus
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Dépenses
              </span>
            </div>
          </div>
        </Card>

        {/* --- Transactions récentes --- */}
        <div className="flex justify-between items-center pt-2">
          <h3 className="font-bold text-slate-800">Transactions Récentes</h3>
          {transactions.length > 3 && (
            <button 
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="text-brand-purple text-sm font-medium hover:text-brand-purple/80 transition-colors"
            >
              {showAllTransactions ? 'Voir moins' : 'Afficher plus'}
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>Aucune transaction pour le moment</p>
            </div>
          ) : (
            recentTransactions.map(t => (
              <Card 
                key={t.id} 
                className="p-3 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <TransactionIcon 
                    iconName={t.category_icon} 
                    color={t.category_color} 
                  />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {t.description || t.category_name}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {format(new Date(t.date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} {currency}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
