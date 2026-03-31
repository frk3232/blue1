import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Shield, Menu, User, LogOut, Bell, Settings, Navigation2 } from 'lucide-react';
import { auth, signInWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, serverTimestamp, getDocFromServer, doc } from 'firebase/firestore';
import { Map } from './components/Map';
import { Search } from './components/Search';
import { AIInsights } from './components/AIInsights';
import { predictTraffic } from './services/geminiService';
import { SafetyHotspot, TrafficLog } from './types';
import { cn } from './lib/utils';

const KOCHI_COORDS: [number, number] = [9.9312, 76.2673];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotspots, setHotspots] = useState<SafetyHotspot[]>([]);
  const [prediction, setPrediction] = useState<{ isJam: boolean; text: string } | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(KOCHI_COORDS);
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | undefined>();

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'safety_hotspots'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && user?.email === "fadlur775@gmail.com") {
        // Seed initial data only if admin
        const initialSpots = [
          { locationName: "MG Road Junction", lat: 9.9724, lng: 76.2856, riskLevel: "High" },
          { locationName: "Vyttila Hub", lat: 9.9658, lng: 76.3214, riskLevel: "Med" },
          { locationName: "Palarivattom Bypass", lat: 9.9958, lng: 76.3124, riskLevel: "High" }
        ];
        initialSpots.forEach(async (spot) => {
          try {
            await addDoc(collection(db, 'safety_hotspots'), spot);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'safety_hotspots');
          }
        });
      }
      const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SafetyHotspot));
      setHotspots(spots);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'safety_hotspots');
    });
    return unsubscribe;
  }, [user]);

  const handleSearch = async (destination: string) => {
    setPredicting(true);
    const mockDest: [number, number] = [9.97, 76.28];
    const mockPolyline: [number, number][] = [
      KOCHI_COORDS,
      [9.94, 76.27],
      [9.95, 76.275],
      [9.96, 76.28],
      mockDest
    ];
    
    setRoutePolyline(mockPolyline);
    setCurrentCenter(mockDest);

    try {
      const mockTrafficData = {
        route: destination,
        current_delay: Math.floor(Math.random() * 10),
        historical_trend: "increasing",
        local_time: new Date().toLocaleTimeString()
      };

      const result = await predictTraffic(mockTrafficData, new Date().toLocaleTimeString());
      setPrediction({ isJam: result.is_predicted_jam, text: result.recommendation_text });

      if (user) {
        try {
          await addDoc(collection(db, 'traffic_logs'), {
            uid: user.uid,
            routeId: destination,
            currentTravelTime: 1200,
            aiPredictedTime: result.is_predicted_jam ? 1800 : 1200,
            isPredictedJam: result.is_predicted_jam,
            recommendationText: result.recommendation_text,
            timestamp: serverTimestamp()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'traffic_logs');
        }
      }
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Navigation2 className="text-white w-6 h-6" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Initializing Blue1...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-20 flex-col items-center py-8 bg-white border-r border-slate-200">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-12 shadow-lg shadow-blue-100">
          <Navigation2 className="text-white w-5 h-5" />
        </div>
        <nav className="flex flex-col gap-8 flex-1">
          <button className="p-2 text-blue-600 bg-blue-50 rounded-lg"><MapPin className="w-6 h-6" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Shield className="w-6 h-6" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Bell className="w-6 h-6" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Settings className="w-6 h-6" /></button>
        </nav>
        <div className="mt-auto">
          {user ? (
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="lg:hidden w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
              <Menu className="w-5 h-5 text-slate-600" />
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Blue1</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-slate-100" />
                <span className="text-sm font-medium text-slate-700">{user.displayName?.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </header>

        {/* Map Area */}
        <div className="flex-1">
          <Map 
            center={currentCenter} 
            hotspots={hotspots} 
            routePolyline={routePolyline}
            isJam={prediction?.isJam}
          />
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 flex flex-col gap-4">
          <AIInsights 
            loading={predicting} 
            isJam={prediction?.isJam || false} 
            recommendation={prediction?.text || ''} 
          />
          <Search onSearch={handleSearch} />
        </div>
      </main>
    </div>
  );
}
