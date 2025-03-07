<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = "Por favor, preencha todos os campos";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = err.message || "Falha ao fazer login";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Entre na sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <NuxtLink
            to="/auth/register"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            crie uma conta
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <TextField
            v-model="email"
            type="email"
            label="Email"
            placeholder="email@exemplo.com"
            :error="error"
          />

          <TextField
            v-model="password"
            type="password"
            label="Senha"
            placeholder="Sua senha"
            :error="error"
          />
        </div>

        <div>
          <Button
            variant="primary"
            type="submit"
            size="lg"
            class="w-full"
            :loading="loading"
          >
            Entrar
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
