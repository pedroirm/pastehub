<script setup>
import { ref, onMounted } from "vue";
import { useTextStore } from "~/stores/text";
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 🔹 Importando i18n corretamente
const textStore = useTextStore();
const texts = ref([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const data = await textStore.fetchTexts();
    texts.value = data;
  } catch (err) {
    error.value = t("common.error");
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const copyLink = (shareableId) => {
  navigator.clipboard.writeText(
    `${window.location.origin}/share/${shareableId}`
  );
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t("dashboard.myTexts") }}</h1>
      <NuxtLink to="/text/new">
        <Button variant="primary">{{ t("dashboard.newText") }}</Button>
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
      ></div>
      <p class="mt-2">{{ t("common.loading") }}</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      {{ error }}
    </div>

    <div v-else-if="texts.length === 0" class="text-center py-8">
      <p class="text-gray-500">{{ t("dashboard.noTexts") }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="text in texts"
        :key="text.id"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2 truncate">{{ text.title }}</h2>
          <p class="text-gray-600 text-sm mb-4">
            {{ t("dashboard.updated") }} {{ formatDate(text.updatedAt) }}
          </p>
          <p class="text-gray-800 mb-4 line-clamp-3">{{ text.content }}</p>

          <div class="flex items-center text-sm text-gray-500 mb-4">
            <span class="flex items-center mr-4">
              <transition name="count" mode="out-in">
                <span
                  :key="text._count?.visualizations || 0"
                  class="transition-all duration-300"
                >
                  {{ text._count?.visualizations || 0 }}
                  {{ t("dashboard.views") }}
                </span>
              </transition>
            </span>

            <span class="flex items-center">
              {{
                text.published ? t("dashboard.published") : t("dashboard.draft")
              }}
            </span>
          </div>

          <div class="flex justify-between">
            <NuxtLink :to="`/text/edit/${text.id}`">
              <Button variant="secondary" size="sm">{{
                t("common.edit")
              }}</Button>
            </NuxtLink>

            <Button
              v-if="text.published"
              variant="primary"
              size="sm"
              @click="copyLink(text.shareableId)"
            >
              {{ t("common.copy") }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
