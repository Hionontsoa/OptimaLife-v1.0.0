/**
 * Écran Authentification - Connexion et Inscription
 * Gère l'authentification des utilisateurs avec validation robuste
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { validateCredentials, registerUser, StorageKeys } from './utilitaires';
import { RHLogo } from './Composants';

interface AuthenticationProps {
  onLogin: (token: string) => void;
}

export const Authentification: React.FC<AuthenticationProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Traiter la soumission du formulaire d'authentification ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simuler un délai réseau
      
      if (isLogin) {
        // --- CONNEXION: Valider les identifiants ---
        if (!validateCredentials(username, password)) {
          setError('Identifiants invalides. Essayez demo/demo');
          setIsLoading(false);
          return;
        }
      } else {
        // --- INSCRIPTION: Enregistrer le nouvel utilisateur ---
        if (!registerUser(username, password)) {
          setError('Inscription échouée. Vérifiez les critères (min 3 caractères pour username, 4 pour password)');
          setIsLoading(false);
          return;
        }
      }
      
      // --- Authentification réussie - générer un token ---
      const token = 'zen_token_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('zen_token', token);
      localStorage.setItem(StorageKeys.USERNAME, username);
      localStorage.setItem('zen_demo_mode', username === 'demo' ? 'true' : 'false');
      
      onLogin(token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-4xl p-8 shadow-xl shadow-slate-200 border border-slate-100"
      >
        {/* --- Logo RH ZenManager --- */}
        <div className="flex justify-center mb-6">
          <RHLogo size={80} />
        </div>

        {/* --- Titre et sous-titre --- */}
        <h2 className="text-2xl font-bold text-center mb-2 font-display text-brand-dark">
          OptimaLife
        </h2>
        <p className="text-slate-500 text-center text-sm mb-8">
          {isLogin 
            ? 'Connectez-vous pour synchroniser vos données' 
            : 'Créez un compte pour sauvegarder vos données'}
        </p>

        {/* --- Formulaire d'authentification --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ utilisateur */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
              Utilisateur
            </label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          {/* Champ mot de passe */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
              Mot de passe
            </label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>
          
          {/* Affichage des erreurs */}
          {error && (
            <p className="text-rose-500 text-xs text-center font-medium bg-rose-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Bouton de soumission */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-purple text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </>
            )}
          </button>
        </form>

        {/* --- Info Mode Démo --- */}
        <div className="mt-4 p-3 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl">
          <p className="text-[11px] font-medium text-brand-cyan mb-1">💡 Mode Démo</p>
          <p className="text-[11px] text-slate-600">
            Utilisateur: <code className="font-mono bg-white px-1 rounded">demo</code>
          </p>
          <p className="text-[11px] text-slate-600">
            Mot de passe: <code className="font-mono bg-white px-1 rounded">demo</code>
          </p>
        </div>

        {/* --- Bouton pour basculer entre connexion et inscription --- */}
        <button 
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setUsername('');
            setPassword('');
          }}
          className="w-full mt-4 text-sm text-brand-purple font-medium hover:text-brand-purple/80 transition-colors"
        >
          {isLogin 
            ? "Pas encore de compte ? S'inscrire" 
            : "Déjà un compte ? Se connecter"}
        </button>
      </motion.div>
    </div>
  );
};
