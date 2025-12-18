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
  image: string; // Server URL
}

// ✅ NEW: Temple Interface Add kiya
export interface Temple {
  id: string;
  name: string;
  location: string;
  image: string; // Server URL
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
  services: PujaService[]; 
  temples: Temple[]; // ✅ Context me Temples add kiya
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "@namandarshan_user",
  REQUESTS: "@namandarshan_requests",
  RESPONSES: "@namandarshan_responses",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PujaRequest[]>([]);
  const [panditResponses, setPanditResponses] = useState<PanditResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ States for API Data
  const [services, setServices] = useState<PujaService[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]); // ✅ Temples State

  // ✅ YAHAN APNA NGROK LINK DALO
  const API_URL = "https://subdistichous-atmospherically-nida.ngrok-free.dev";

  useEffect(() => {
    loadStoredData();
    fetchServices(); // <-- Server se data mangwana shuru
  }, []);

  // ✅ Function to Fetch Data from API (Updated)
  const fetchServices = async () => {
    try {
      console.log("Fetching data from:", API_URL);

      // 1. Fetch Services
      const servicesRes = await fetch(`${API_URL}/api/services`);
      const servicesData = await servicesRes.json();
      setServices(servicesData);

      // 2. Fetch Temples (✅ Ye line add ki hai)
      const templesRes = await fetch(`${API_URL}/api/temples`);
      const templesData = await templesRes.json();
      setTemples(templesData);

    } catch (error) {
      console.error("API Error:", error);
      // Fallback: Agar API fail ho to empty array rakho taaki app crash na ho
    }
  };

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

  // ✅ UPDATED: Server par Data Save karne wala function
  const createRequest = useCallback(async (requestData: Omit<PujaRequest, "id" | "userId" | "status" | "createdAt">) => {
    if (!user) return;
    
    const newRequest: PujaRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      userId: user.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // 1. Local State Update (Instant dikhane ke liye)
    setRequests(prev => {
      const updated = [...prev, newRequest];
      saveRequests(updated);
      return updated;
    });

    // 2. ✅ Server par data bhejna (WordPress connection ke liye)
    try {
      // ✅ Yahan humne Name aur Phone jooda hai taaki WordPress par dikhe
      const payload = {
        ...newRequest,
        userName: user.name,
        userPhone: user.phone, 
      };

      console.log("Sending booking to server...", payload);
      
      const headers = { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      };
      
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload), // ✅ newRequest ki jagah payload bheja
      });

      const result = await response.json();
      console.log("Server Response:", result);

    } catch (error) {
      console.error("❌ Booking Send Error:", error);
    }

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
        services, // ✅ Services
        temples,  // ✅ Temples bhi pass kar diye
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