/**
 * Application Principale - RH ZenManager v1.1
 * Gestionnaire Personnel de Finances et Productivité
 * 
 * Architecture: Composants séparés en modules dans src/composants/
 * Persistance: localStorage avec gestion d'état centralisée
 * Authentification: Validation des identifiants avec session locale
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Imports des composants ---
import { Authentification } from './composants/Authentification';
import { Accueil } from './composants/Accueil';
import { Finances } from './composants/Finances';
import { Taches } from './composants/Taches';
import { Objectifs } from './composants/Objectifs';
import { Rapports } from './composants/Rapports';
import { Reglages } from './composants/Reglages';
import { BottomNav, BiometricLock } from './composants/Composants';

// --- Imports des utilitaires et contexte ---
import { 
  StorageKeys, 
  initializeUserData, 
  getStorageData
} from './composants/utilitaires';
import { CurrencyProvider } from './composants/contexte';
import { DonneesProvider } from './composants/GestionDonnees';

// --- Écran principal avec gestion des onglets ---
function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('zen_token'));
  const [isLocked, setIsLocked] = useState(
    localStorage.getItem('zen_biometric') === 'true'
  );

  // --- Gérer la connexion utilisateur ---
  const handleLogin = (newToken: string) => {
    localStorage.setItem('zen_token', newToken);
    initializeUserData();  // Initialiser les données vierges pour le nouvel utilisateur
    setToken(newToken);
  };

  // --- Gérer la déconnexion utilisateur ---
  const handleLogout = () => {
    localStorage.removeItem('zen_token');
    localStorage.removeItem('zen_biometric');
    localStorage.removeItem(StorageKeys.USERNAME);
    setToken(null);
    setIsLocked(false);
    // Réinitialiser à la page d'authentification
    window.location.reload();
  };

  // --- Afficher l'écran d'authentification si l'utilisateur n'est pas connecté ---
  if (!token) {
    return <Authentification onLogin={handleLogin} />;
  }

  // --- Afficher le verrouillage biométrique si activé ---
  if (isLocked) {
    return <BiometricLock onUnlock={() => setIsLocked(false)} />;
  }

  // --- Rendu du composant actif selon l'onglet sélectionné ---
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Accueil />;
      case 'finance':
        return <Finances />;
      case 'tasks':
        return <Taches />;
      case 'goals':
        return <Objectifs />;
      case 'reports':
        return <Rapports />;
      case 'settings':
        return <Reglages onLogout={handleLogout} />;
      default:
        return <Accueil />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative overflow-x-hidden">
      {/* --- Animation de transition entre les écrans --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      
      {/* --- Navigation inférieure --- */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// --- Wrapper principal avec Currency + Donnees Providers ---
/**
 * Composant racine de l'application
 * Enveloppe AppContent avec les providers pour la gestion de la devise et des données
 */
export default function App() {
  const [currency] = useState(
    getStorageData<string>(StorageKeys.CURRENCY, 'Ar')
  );

  return (
    <CurrencyProvider initialCurrency={currency}>
      <DonneesProvider>
        <AppContent />
      </DonneesProvider>
    </CurrencyProvider>
  );
}
