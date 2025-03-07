<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
