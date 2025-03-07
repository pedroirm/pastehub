<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const { locale, t, setLocale } = useI18n();

onMounted(() => {
  authStore.initAuth();
});

const logout = () => {
  authStore.logout();
  router.push("/auth/login");
};

const changeLocale = () => {
  const newLocale = locale.value === "en" ? "pt" : "en";
  locale.value = newLocale;
  setLocale(newLocale);
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <header class="bg-white shadow">
      <div
        class="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <h1 class="text-xl font-bold text-gray-900">PasteHub</h1>

        <div class="flex items-center">
          <button
            class="mr-4 px-3 py-1 bg-gray-200 rounded-md text-sm"
            @click="changeLocale"
          >
            {{ locale === "en" ? "PT" : "EN" }}
          </button>

          <template v-if="authStore.isLoggedIn">
            <span class="mr-4 text-gray-700">{{ authStore.user?.name }}</span>
            <Button variant="secondary" size="sm" @click="logout">
              {{ t("common.logout") }}
            </Button>
          </template>

          <template v-else>
            <div class="flex items-center space-x-2">
              <NuxtLink to="/auth/login">
                <Button variant="secondary" size="sm">{{
                  t("common.login")
                }}</Button>
              </NuxtLink>
              <NuxtLink to="/auth/register">
                <Button variant="primary" size="sm">{{
                  t("common.register")
                }}</Button>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-white mt-8 py-4 border-t">
      <div class="container mx-auto px-4 text-center text-gray-600 text-sm">
        &copy; 2025 PasteHub. {{ t("common.allRightsReserved") }}
      </div>
    </footer>
  </div>
</template>
