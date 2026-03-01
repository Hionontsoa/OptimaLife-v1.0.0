/**
 * Écran Réglages - Configuration et Préférences
 * Gère les paramètres utilisateur, devise, synchronisation et sécurité
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Cloud, RefreshCw, Settings, ShieldCheck, 
  Fingerprint, LayoutDashboard, Calendar, ChevronRight, LogOut, Trash2
} from 'lucide-react';
import { apiFetch, StorageKeys } from './utilitaires';
import { useCurrency } from './contexte';
import { Header, Card } from './Composants';

interface SettingsProps {
  onLogout: () => void;
}

export const Reglages: React.FC<SettingsProps> = ({ onLogout }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('zen_biometric') === 'true'
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { currency, setCurrency } = useCurrency();

  // --- Effectuer une synchronisation cloud ---
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simuler un processus de synchronisation profonde
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastSync(new Date().toLocaleTimeString());
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Mettre à jour la devise ---
  const updateCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);
    await apiFetch('/api/user/settings', {
      method: 'PATCH',
      body: JSON.stringify({ currency: newCurrency })
    });
  };

  // --- Basculer la biométrie ---
  const toggleBiometric = () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    localStorage.setItem('zen_biometric', String(newValue));
  };

  // --- Réinitialiser toutes les données ---
  const resetAllData = async () => {
    setIsResetting(true);
    try {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Supprimer le token AVANT de supprimer les données
      localStorage.removeItem('zen_token');
      localStorage.removeItem('zen_biometric');
      
      // Supprimer toutes les clés de données utilisateur (utiliser les vraies valeurs)
      const keysToRemove = [
        StorageKeys.TRANSACTIONS,
        StorageKeys.TASKS,
        StorageKeys.GOALS,
        StorageKeys.CURRENCY,
        StorageKeys.USERS,
        StorageKeys.PIN,
        StorageKeys.BIOMETRIC,
        StorageKeys.DARK_MODE,
        StorageKeys.NOTIFICATIONS,
        StorageKeys.USERNAME,
        StorageKeys.BUDGET_LIMITS,
        StorageKeys.TASK_RECURRENCE,
        StorageKeys.COMPLETED_GOALS,
        StorageKeys.SUB_GOALS,
        StorageKeys.BACKUP_DATA,
        StorageKeys.LAST_BACKUP,
      ];
      
      // Supprimer toutes les données
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Recharger la page pour retourner à l'authentification
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } finally {
      setIsResetting(false);
    }
  };

  // --- Listes des devises disponibles ---
  const currencies = [
    { label: 'Euro (€)', value: '€' },
    { label: 'Dollar ($)', value: '$' },
    { label: 'Ariary (Ar)', value: 'Ar' },
    { label: 'Livre (£)', value: '£' },
    { label: 'Yen (¥)', value: '¥' },
    { label: 'Franc (CHF)', value: 'CHF' },
  ];

  return (
    <div className="pb-24">
      <Header 
        title="Réglages" 
        subtitle="Personnalisez votre expérience" 
      />
      
      <div className="px-6 space-y-6">
        {/* --- Section Préférences --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Préférences
          </h3>
          <Card className="p-4 space-y-4 border-2 border-slate-100 focus-within:ring-2 focus-within:ring-brand-purple/50">
            {/* --- Sélection de devise --- */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
                  <Wallet size={18} />
                </div>
                <span className="font-medium text-sm">Devise</span>
              </div>
              <select 
                value={currency}
                onChange={(e) => updateCurrency(e.target.value)}
                className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-purple cursor-pointer hover:bg-slate-100 transition-colors shadow-sm focus:shadow-md"
              >
                {currencies.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </div>

        {/* --- Section Synchronisation Cloud --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Cloud Sync
          </h3>
          <Card className="p-4 flex items-center justify-between border-2 border-slate-100 focus-within:ring-2 focus-within:ring-brand-purple/50">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
                <Cloud size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Synchronisation Cloud</p>
                <p className="text-[10px] text-slate-400">
                  Dernière synchro : {lastSync}
                </p>
              </div>
            </div>

            {/* --- Bouton synchronisation --- */}
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`p-2 rounded-xl transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                isSyncing 
                  ? 'bg-slate-100 text-slate-400 animate-spin' 
                  : 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 shadow-sm hover:shadow-md'
              }`}
            >
              <RefreshCw size={18} />
            </button>
          </Card>
        </div>

        {/* --- Section Compte --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Compte
          </h3>
          <Card className="p-0 overflow-hidden border-2 border-slate-100">
            {/* Bouton Profil */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-purple">
              <div className="flex items-center gap-3">
                <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
                  <Settings size={18} />
                </div>
                <span className="font-medium">Profil</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            {/* Bouton Sécurité & PIN */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-purple">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-medium">Sécurité & PIN</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            {/* --- Toggle Verrouillage Biométrique --- */}
            <div className="p-4 flex items-center justify-between focus-within:ring-2 focus-within:ring-inset focus-within:ring-brand-purple">
              <div className="flex items-center gap-3">
                <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
                  <Fingerprint size={18} />
                </div>
                <span className="font-medium">Verrouillage Biométrique</span>
              </div>

              {/* --- Toggle switch --- */}
              <button 
                onClick={toggleBiometric}
                className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                  biometricEnabled 
                    ? 'bg-brand-purple' 
                    : 'bg-slate-200'
                }`}
              >
                <motion.div 
                  animate={{ x: biometricEnabled ? 24 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </Card>
        </div>

        {/* --- Section Application --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Application
          </h3>
          <Card className="p-0 overflow-hidden border-2 border-slate-100">
            {/* Mode Sombre (Désactivé pour l'instant) */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 opacity-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-brand-purple">
              <div className="flex items-center gap-3">
                <div className="bg-brand-purple/10 p-2 rounded-xl text-brand-purple">
                  <LayoutDashboard size={18} />
                </div>
                <span className="font-medium">Mode Sombre</span>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            {/* Notifications (Désactivé pour l'instant) */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 opacity-50 cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-purple">
              <div className="flex items-center gap-3">
                <div className="bg-brand-cyan/10 p-2 rounded-xl text-brand-cyan">
                  <Calendar size={18} />
                </div>
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          </Card>
        </div>

        {/* --- Section Données --- */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Données
          </h3>
          <Card className="p-0 overflow-hidden border-2 border-slate-100">
            {/* Bouton Réinitialiser les données */}
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 border-b border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
            >
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
                  <Trash2 size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-rose-600">Réinitialiser les données</p>
                  <p className="text-[10px] text-slate-400">Supprimer toutes les données utilisateur</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          </Card>
        </div>

        {/* --- Informations Utiles --- */}
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-brand-cyan uppercase">💡 À Venir</p>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
            <li>Mode sombre avec thème personnalisé</li>
            <li>Notifications et rappels pour les tâches</li>
            <li>Profil utilisateur éditable</li>
            <li>PIN de déverrouillage</li>
          </ul>
        </div>
      </div>

      {/* --- Bouton Déconnexion --- */}
      <div className="px-6 mt-6">
        <button 
          onClick={onLogout}
          className="w-full py-4 text-rose-600 font-bold flex items-center justify-center gap-2 hover:bg-rose-50/50 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-lg shadow-rise-600/10 hover:shadow-lg"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>

      {/* --- Modal de Confirmation Réinitialisation --- */}
      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={() => !isResetting && setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full bg-white rounded-t-3xl p-6 space-y-4 pb-24 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Titre */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Réinitialiser toutes les données ?
              </h3>
              <p className="text-sm text-slate-600">
                Cette action va supprimer définitivement :
              </p>
            </div>

            {/* Liste des données à supprimer */}
            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2 focus-within:ring-2 focus-within:ring-rose-500 focus-within:ring-opacity-50">
              <p className="text-[13px] text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                Toutes les transactions
              </p>
              <p className="text-[13px] text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                Toutes les tâches
              </p>
              <p className="text-[13px] text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                Tous les objectifs
              </p>
              <p className="text-[13px] text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                Tous les budgets
              </p>
              <p className="text-[13px] text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                Toutes les sauvegardes
              </p>
            </div>

            {/* Avertissement */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-opacity-50">
              <p className="text-sm font-bold text-amber-900">⚠️ Attention</p>
              <p className="text-[12px] text-amber-800 mt-1">
                Cette action est irréversible. Vous serez déconnecté après la réinitialisation.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-6 sticky bottom-0 bg-white px-0 py-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm hover:shadow-md"
              >
                Annuler
              </button>
              <button
                onClick={resetAllData}
                disabled={isResetting}
                className="flex-1 py-3 px-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-lg shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30"
              >
                {isResetting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Réinitialiser
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
