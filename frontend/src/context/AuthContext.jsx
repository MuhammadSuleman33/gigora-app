import {
  createContext,
  useState,
  useEffect,
} from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(
      localStorage.getItem("gigora_user")
    ) || null
  );

  useEffect(() => {
    const token = localStorage.getItem(
      "gigora_access_token"
    );

    if (!token) return;

    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data.user);

        localStorage.setItem(
          "gigora_user",
          JSON.stringify(res.data.user)
        );
      })
      .catch(() => {
        localStorage.removeItem(
          "gigora_access_token"
        );
        localStorage.removeItem(
          "gigora_user"
        );
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}