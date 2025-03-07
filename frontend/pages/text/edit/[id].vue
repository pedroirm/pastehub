<script setup>
definePageMeta({
  middleware: ["auth"],
});

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTextStore } from "~/stores/text";
import { useI18n } from "vue-i18n";

const { t } = useI18n(); // 🔹 Importando i18n corretamente
const route = useRoute();
const router = useRouter();
const textStore = useTextStore();

const text = ref({
  title: "",
  content: "",
  published: false,
});

const loading = ref(true);
const saveLoading = ref(false);
const error = ref("");
const id = route.params.id;

onMounted(async () => {
  try {
    const data = await textStore.fetchTextById(id);
    text.value = {
      title: data.title,
      content: data.content,
      published: data.published,
    };
  } catch (err) {
    error.value = t("common.error");
  } finally {
    loading.value = false;
  }
});

const saveText = async () => {
  if (!text.value.title || !text.value.content) {
    error.value = t("text.requiredFields");
    return;
  }

  saveLoading.value = true;
  try {
    await textStore.updateText(id, text.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = t("common.error");
  } finally {
    saveLoading.value = false;
  }
};

const deleteText = async () => {
  if (!confirm(t("text.confirmDelete"))) {
    return;
  }

  saveLoading.value = true;
  try {
    await textStore.deleteText(id);
    router.push("/dashboard");
  } catch (err) {
    error.value = t("common.error");
  } finally {
    saveLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t("text.editText") }}</h1>
      <div class="flex space-x-2">
        <Button @click="router.push('/dashboard')" variant="secondary">
          {{ t("common.cancel") }}
        </Button>
        <Button @click="deleteText" variant="danger" :loading="saveLoading">
          {{ t("text.deleteText") }}
        </Button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
      ></div>
      <p class="mt-2">{{ t("text.loadingText") }}</p>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg p-6">
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {{ error }}
      </div>

      <form @submit.prevent="saveText">
        <TextField
          v-model="text.title"
          :label="t('text.title')"
          :placeholder="t('text.titlePlaceholder')"
        />

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            t("text.content")
          }}</label>
          <textarea
            v-model="text.content"
            rows="12"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('text.contentPlaceholder')"
          ></textarea>
        </div>

        <div class="flex items-center mb-4">
          <input
            id="published"
            type="checkbox"
            v-model="text.published"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="published" class="ml-2 block text-sm text-gray-900">
            {{ t("text.publishText") }}
          </label>
        </div>

        <div class="flex justify-end">
          <Button type="submit" variant="primary" :loading="saveLoading">
            {{ t("text.saveChanges") }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
