/**
 * Composants Partagés - Petits composants réutilisables
 * Logo, Header, Card, Navigation, Icons, etc.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  Target, 
  Settings,
  Fingerprint,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ICONS } from '../types';

// --- Logo RH ZenManager ---
export const RHLogo = ({ size = 64 }: { size?: number }) => (
  <div 
    className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-lg"
    style={{ 
      width: size, 
      height: size, 
      background: 'linear-gradient(135deg, #FF007A 0%, #7000FF 50%, #00D1FF 100%)' 
    }}
  >
    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
    <span className="text-white font-black italic tracking-tighter" style={{ fontSize: size * 0.4 }}>RH</span>
    <div className="absolute bottom-1 right-1 opacity-80">
      <div className="w-2 h-2 bg-white rounded-full blur-[1px]" />
    </div>
  </div>
);

// --- En-tête de page ---
export const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <header className="px-6 pt-8 pb-4">
    <h1 className="text-2xl font-bold text-slate-900 font-display">{title}</h1>
    {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
  </header>
);

// --- Carte générique réutilisable ---
export const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// --- Icône de transaction avec couleur ---
export const TransactionIcon = ({ iconName, color }: { iconName: string, color: string }) => {
  const Icon = (ICONS as any)[iconName] || Wallet;
  return (
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      <Icon size={20} />
    </div>
  );
};

// --- Navigation inférieure avec onglets ---
export const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { id: 'finance', icon: Wallet, label: 'Finances' },
    { id: 'tasks', icon: CheckSquare, label: 'Tâches' },
    { id: 'goals', icon: Target, label: 'Objectifs' },
    { id: 'reports', icon: BarChart3, label: 'Rapports' },
    { id: 'settings', icon: Settings, label: 'Réglages' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pb-safe pt-2 flex justify-around items-center z-50 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            activeTab === tab.id ? 'text-brand-purple scale-110' : 'text-slate-400'
          }`}
        >
          <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Verrouillage biométrique ---
export const BiometricLock = ({ onUnlock }: { onUnlock: () => void }) => {
  const [error, setError] = React.useState('');

  const handleBiometric = async () => {
    try {
      // Simuler un délai d'authentification biométrique
      await new Promise(resolve => setTimeout(resolve, 1200));
      onUnlock();
    } catch (err) {
      setError("Échec de l'authentification");
    }
  };

  React.useEffect(() => {
    handleBiometric();
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-brand-purple/10 rounded-full flex items-center justify-center mb-8 mx-auto">
          <Fingerprint size={48} className="text-brand-purple animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2 font-display">Accès Sécurisé</h2>
        <p className="text-slate-500 mb-12 max-w-70 mx-auto">Utilisez votre empreinte ou reconnaissance faciale pour déverrouiller OptimaLife</p>
        
        <button 
          onClick={handleBiometric}
          className="bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 flex items-center gap-2 mx-auto active:scale-95 transition-transform"
        >
          <Fingerprint size={20} />
          Réessayer
        </button>
        
        {error && <p className="mt-4 text-rose-500 font-medium">{error}</p>}
      </motion.div>
    </div>
  );
};
