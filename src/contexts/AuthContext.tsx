import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, Department } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If permission denied, we might still want to let them be "logged in" as a basic user 
          // or handle it appropriately. For now, just logging avoids the unhandled promise rejection.
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string, phone: string) => {
    if (!selectedRole) throw new Error('Please select a role');
    if (selectedRole === 'department' && !selectedDepartment) {
      throw new Error('Please select a department');
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const userData: Partial<User> = {
      uid: user.uid,
      email: email,
      displayName: displayName,
      role: selectedRole,
      phoneNumber: phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (selectedRole === 'department' && selectedDepartment) {
      userData.department = selectedDepartment;
    }

    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const loginWithGoogle = async () => {
    if (!selectedRole) throw new Error('Please select a role');
    if (selectedRole === 'department' && !selectedDepartment) {
      throw new Error('Please select a department');
    }

    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      const userData: Partial<User> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        role: selectedRole,
        phoneNumber: user.phoneNumber || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (selectedRole === 'department' && selectedDepartment) {
        userData.department = selectedDepartment;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setSelectedRole(null);
    setSelectedDepartment(null);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    selectedRole,
    setSelectedRole,
    selectedDepartment,
    setSelectedDepartment,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
