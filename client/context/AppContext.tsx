import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "user" | "pandit";

export type RequestStatus = "pending" | "accepted" | "countered" | "confirmed";

export interface PujaService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  temple: string;
  imageUrl?: string;
}

export interface PujaRequest {
  id: string;
  userId: string;
  serviceName: string;
  temple: string;
  date: string;
  time: string;
  userBudgetPrice: number;
  status: RequestStatus;
  createdAt: string;
}

export interface PanditResponse {
  id: string;
  requestId: string;
  panditId: string;
  panditName: string;
  type: "accepted" | "counter";
  counterAmount?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, role: UserRole, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  requests: PujaRequest[];
  panditResponses: PanditResponse[];
  createRequest: (request: Omit<PujaRequest, "id" | "userId" | "status" | "createdAt">) => void;
  acceptUserPrice: (requestId: string, panditName: string) => void;
  submitCounterOffer: (requestId: string, panditName: string, amount: number) => void;
  acceptPanditOffer: (requestId: string, responseId: string) => void;
  getRequestsForUser: () => PujaRequest[];
  getOpenRequestsForPandits: () => PujaRequest[];
  getResponsesForRequest: (requestId: string) => PanditResponse[];
  getMyBookings: () => PujaRequest[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "@namandarshan_user",
  REQUESTS: "@namandarshan_requests",
  RESPONSES: "@namandarshan_responses",
};

const sampleServices: PujaService[] = [
  { id: "1", name: "Rudrabhishek", description: "Sacred Shiva worship with holy water", basePrice: 501, temple: "Mahakaleshwar Temple" },
  { id: "2", name: "Satyanarayan Puja", description: "Lord Vishnu worship for prosperity", basePrice: 751, temple: "ISKCON Temple" },
  { id: "3", name: "Ganesh Puja", description: "Remove obstacles and bring success", basePrice: 351, temple: "Siddhivinayak Temple" },
  { id: "4", name: "Navgraha Shanti", description: "Planetary peace and harmony", basePrice: 1100, temple: "Ujjain Navgraha" },
  { id: "5", name: "Kaal Sarp Dosh Nivaran", description: "Remove serpent doshas", basePrice: 2100, temple: "Trimbakeshwar" },
];

export const pujaServices = sampleServices;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PujaRequest[]>([]);
  const [panditResponses, setPanditResponses] = useState<PanditResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedRequests, storedResponses] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.REQUESTS),
        AsyncStorage.getItem(STORAGE_KEYS.RESPONSES),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedRequests) setRequests(JSON.parse(storedRequests));
      if (storedResponses) setPanditResponses(JSON.parse(storedResponses));
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequests = async (newRequests: PujaRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(newRequests));
    } catch (error) {
      console.error("Error saving requests:", error);
    }
  };

  const saveResponses = async (newResponses: PanditResponse[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(newResponses));
    } catch (error) {
      console.error("Error saving responses:", error);
    }
  };

  const login = useCallback(async (phone: string, role: UserRole, name?: string) => {
    const newUser: User = {
      id: `${role}_${Date.now()}`,
      name: name || (role === "pandit" ? "Pandit Ji" : "Devotee"),
      phone,
      role,
    };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const createRequest = useCallback((requestData: Omit<PujaRequest, "id" | "userId" | "status" | "createdAt">) => {
    if (!user) return;
    
    const newRequest: PujaRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      userId: user.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests(prev => {
      const updated = [...prev, newRequest];
      saveRequests(updated);
      return updated;
    });
  }, [user]);

  const acceptUserPrice = useCallback((requestId: string, panditName: string) => {
    if (!user) return;

    const newResponse: PanditResponse = {
      id: `resp_${Date.now()}`,
      requestId,
      panditId: user.id,
      panditName,
      type: "accepted",
      createdAt: new Date().toISOString(),
    };

    setPanditResponses(prev => {
      const updated = [...prev, newResponse];
      saveResponses(updated);
      return updated;
    });

    setRequests(prev => {
      const updated = prev.map(r => 
        r.id === requestId ? { ...r, status: "accepted" as RequestStatus } : r
      );
      saveRequests(updated);
      return updated;
    });
  }, [user]);

  const submitCounterOffer = useCallback((requestId: string, panditName: string, amount: number) => {
    if (!user) return;

    const newResponse: PanditResponse = {
      id: `resp_${Date.now()}`,
      requestId,
      panditId: user.id,
      panditName,
      type: "counter",
      counterAmount: amount,
      createdAt: new Date().toISOString(),
    };

    setPanditResponses(prev => {
      const updated = [...prev, newResponse];
      saveResponses(updated);
      return updated;
    });

    setRequests(prev => {
      const updated = prev.map(r => 
        r.id === requestId && r.status === "pending" 
          ? { ...r, status: "countered" as RequestStatus } 
          : r
      );
      saveRequests(updated);
      return updated;
    });
  }, [user]);

  const acceptPanditOffer = useCallback((requestId: string, responseId: string) => {
    setRequests(prev => {
      const updated = prev.map(r => 
        r.id === requestId ? { ...r, status: "confirmed" as RequestStatus } : r
      );
      saveRequests(updated);
      return updated;
    });
  }, []);

  const getRequestsForUser = useCallback(() => {
    if (!user) return [];
    return requests.filter(r => r.userId === user.id);
  }, [user, requests]);

  const getOpenRequestsForPandits = useCallback(() => {
    return requests.filter(r => r.status === "pending" || r.status === "countered");
  }, [requests]);

  const getResponsesForRequest = useCallback((requestId: string) => {
    return panditResponses.filter(r => r.requestId === requestId);
  }, [panditResponses]);

  const getMyBookings = useCallback(() => {
    if (!user) return [];
    if (user.role === "pandit") {
      const myResponseRequestIds = panditResponses
        .filter(r => r.panditId === user.id && r.type === "accepted")
        .map(r => r.requestId);
      return requests.filter(r => myResponseRequestIds.includes(r.id) && (r.status === "accepted" || r.status === "confirmed"));
    }
    return requests.filter(r => r.userId === user.id && r.status === "confirmed");
  }, [user, requests, panditResponses]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        requests,
        panditResponses,
        createRequest,
        acceptUserPrice,
        submitCounterOffer,
        acceptPanditOffer,
        getRequestsForUser,
        getOpenRequestsForPandits,
        getResponsesForRequest,
        getMyBookings,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
