import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface LocationContextValue {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedTransitDays: number;
  isPincodeModalOpen: boolean;
  setPincodeModalOpen: (open: boolean) => void;
  updatePincode: (newPin: string) => Promise<{ success: boolean; message: string }>;
}

const LocationContext = createContext<LocationContextValue>({} as any);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincode, setPincode] = useState<string>(localStorage.getItem('picklemart_pincode') || '500034');
  const [city, setCity] = useState<string>(localStorage.getItem('picklemart_city') || 'Hyderabad');
  const [state, setState] = useState<string>(localStorage.getItem('picklemart_state') || 'Telangana');
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [estimatedTransitDays, setEstimatedTransitDays] = useState<number>(2);
  const [isPincodeModalOpen, setPincodeModalOpen] = useState<boolean>(false);

  const checkPin = async (pin: string) => {
    try {
      const res = await api.checkPincode(pin);
      if (res.success && res.delivery) {
        setIsServiceable(res.delivery.isServiceable);
        if (res.delivery.city) setCity(res.delivery.city);
        if (res.delivery.state) setState(res.delivery.state);
        setEstimatedTransitDays(res.delivery.estimatedTransitDays || 3);
        return { success: true, message: `Delivering to ${res.delivery.city || pin}` };
      }
      return { success: false, message: 'PIN code not serviceable at the moment.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error verifying PIN code.' };
    }
  };

  const updatePincode = async (newPin: string) => {
    const clean = newPin.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      return { success: false, message: 'Please enter a valid 6-digit Indian PIN code.' };
    }
    setPincode(clean);
    localStorage.setItem('picklemart_pincode', clean);
    const res = await checkPin(clean);
    if (res.success) {
      localStorage.setItem('picklemart_city', city);
      localStorage.setItem('picklemart_state', state);
    }
    return res;
  };

  useEffect(() => {
    checkPin(pincode);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        pincode,
        city,
        state,
        isServiceable,
        estimatedTransitDays,
        isPincodeModalOpen,
        setPincodeModalOpen,
        updatePincode,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
