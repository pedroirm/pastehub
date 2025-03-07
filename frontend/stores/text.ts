import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import socketService from "~/services/socketService";
import { io, type Socket } from "socket.io-client";
import socket from "~/services/socketService";

export const useTextStore = defineStore("text", {
  state: () => ({
    texts: [] as any[],
    currentText: null as any | null,
    loading: false,
    error: null,
    socketConnected: false,
    socket: null as Socket | null,
  }),
  getters: {
    getAllTexts: (state) => state.texts,
    getCurrentText: (state) => state.currentText,
  },
  actions: {
    async fetchTexts() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await fetch("http://localhost:3000/api/texts", {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar textos");
        }

        if (!this.socketConnected) {
          this.setupSocketListeners();
        }

        const data = await response.json();
        this.texts = data;
        return data;
      } catch (error) {
        console.error("Erro ao buscar textos:", error);
        this.error = (error as any).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTextById(id: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await fetch(`http://localhost:3000/api/texts/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar texto");
        }

        const data = await response.json();
        this.currentText = data;
        return data;
      } catch (error) {
        console.error("Erro ao buscar texto:", error);
        this.error = (error as any).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createText(textData: {}) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await fetch("http://localhost:3000/api/texts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(textData),
        });

        if (!response.ok) {
          throw new Error("Falha ao criar texto");
        }

        const data = await response.json();
        this.texts.push(data);
        return data;
      } catch (error) {
        console.error("Erro ao criar texto:", error);
        this.error = (error as any).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateText(id: string, textData: {}) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await fetch(`http://localhost:3000/api/texts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(textData),
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar texto");
        }

        const data = await response.json();

        const index = this.texts.findIndex((text) => text.id === id);
        if (index !== -1) {
          this.texts[index] = data;
        }

        if (this.currentText && this.currentText.id === id) {
          this.currentText = data;
        }

        return data;
      } catch (error) {
        console.error("Erro ao atualizar texto:", error);
        this.error = (error as any).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteText(id: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await fetch(`http://localhost:3000/api/texts/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao excluir texto");
        }

        // Remover do array de textos
        this.texts = this.texts.filter((text) => text.id !== id);

        // Se este for o texto atual, limpar
        if (this.currentText && this.currentText.id === id) {
          this.currentText = null;
        }

        return true;
      } catch (error) {
        console.error("Erro ao excluir texto:", error);
        this.error = (error as any).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    setupSocketListeners() {
      console.log("🔌 Conectando ao WebSocket...");
      socket.on(
        "text-view-update",
        (data: { textId: string; timestamp: string }) => {
          const textIndex = this.texts.findIndex((t) => t.id === data.textId);
          if (textIndex !== -1) {
            this.$patch((state) => {
              state.texts[textIndex]._count.visualizations =
                (state.texts[textIndex]._count?.visualizations || 0) + 1;
            });
          }
        }
      );
    },
    $onDestroy() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
  },
});
