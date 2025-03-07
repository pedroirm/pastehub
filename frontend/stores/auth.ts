import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null as string | null,
    isAuthenticated: false,
    loading: false,
  }),
  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
  },
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha no login");

        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;

        if (process.client) {
          localStorage.setItem(
            "auth",
            JSON.stringify({ user: data.user, token: data.token })
          );
        }

        return data;
      } catch (error) {
        console.error("Erro no login:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true;
      try {
        // Implementar a chamada de API de registro
        const response = await fetch(
          "http://localhost:3000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Falha no registro");
        }

        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;

        // Armazenar token no localStorage
        localStorage.setItem("token", data.token);

        return data;
      } catch (error) {
        console.error("Erro no registro:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem("token");
    },

    initAuth() {
      if (!process.client) return;

      const token = localStorage.getItem("token");
      if (token) {
        this.token = token;
        this.isAuthenticated = true;
      }
    },
  },
});
