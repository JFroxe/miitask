import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Importamos `getDoc`
import { db } from "../firebaseConfig"; // Importamos Firestore

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("🔑 Usuario autenticado:", user);
    setUser(user);
    setLoading(false);

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Si el usuario no existe, lo creamos
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          businessId: "", // Si el usuario no tiene un negocio asignado
        });
        console.log("✅ Usuario creado en Firestore");
      } else {
        const userData = userSnap.data();
        console.log("ℹ️ Datos del usuario:", userData);

        // ⚡ Asignar el businessId a nivel global si existe
        if (userData.businessId) {
          setUser({ ...user, businessId: userData.businessId });
        }
      }
    }
  });

  return () => unsubscribe();
}, []);


  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("✅ Sesión cerrada correctamente");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
  }
};

export const useAuth = () => useContext(AuthContext);
