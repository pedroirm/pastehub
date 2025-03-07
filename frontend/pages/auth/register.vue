<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = "Por favor, preencha todos os campos";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authStore.register(name.value, email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = err.message || "Falha ao registrar";
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
          Crie sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <NuxtLink
            to="/auth/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            faça login se já possui uma conta
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <TextField
            v-model="name"
            type="text"
            label="Nome"
            placeholder="Seu nome"
            :error="error"
          />

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

          <TextField
            v-model="confirmPassword"
            type="password"
            label="Confirme a senha"
            placeholder="Confirme sua senha"
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
            Registrar
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
