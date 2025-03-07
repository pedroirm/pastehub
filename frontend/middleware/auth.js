export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return; // 🔹 Evita rodar no SSR

  const authStore = useAuthStore();
  authStore.initAuth();

  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
});