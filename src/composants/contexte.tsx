/**
 * Contexte Devise - Gestion centralisée de la devise et conversion
 * Permet à tous les composants d'accéder et modifier la devise actuelle
 */

import React, { useCallback } from 'react';

// --- Type pour le contexte devise ---
export interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  convert: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

// --- Créer le contexte avec valeurs par défaut ---
export const CurrencyContext = React.createContext<CurrencyContextType>({
  currency: '€',
  setCurrency: (_c: string) => {},
  rates: {
    '€': 1,
    '$': 1.10,
    '£': 0.87,
    '¥': 157.50,
    'CHF': 0.95,
    'Ar': 44000,
  },
  convert: (amount: number) => amount,
});

// --- Hook pour utiliser le contexte devise ---
export const useCurrency = (): CurrencyContextType => React.useContext(CurrencyContext);

// --- Provider pour envelopper l'application ---
interface CurrencyProviderProps {
  children: React.ReactNode;
  initialCurrency?: string;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  initialCurrency = 'Ar' 
}) => {
  const [currency, setCurrency] = React.useState(initialCurrency);

  // Taux de change (€ = 1 de base)
  const rates: Record<string, number> = {
    '€': 1,
    '$': 1.10,
    '£': 0.87,
    '¥': 157.50,
    'CHF': 0.95,
    'Ar': 44000,
  };

  // Fonction de conversion optimisée avec useCallback
  const convert = useCallback((amount: number, fromCurrency: string, toCurrency: string): number => {
    // Convertir de la devise source vers € (base), puis vers la devise cible
    const inEuros = amount / (rates[fromCurrency] || 1);
    return inEuros * (rates[toCurrency] || 1);
  }, []);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    rates,
    convert,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
