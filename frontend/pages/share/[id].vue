<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useNuxtApp } from "#app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const { $socket } = useNuxtApp();

const text = ref(null);
const loading = ref(true);
const error = ref("");
const shareableId = route.params.id;
const isUpdated = ref(false);

const fetchSharedText = async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/share/${shareableId}`
    );

    if (!response.ok) {
      throw new Error(t("common.error"));
    }

    const data = await response.json();
    text.value = data;
  } catch (err) {
    error.value = err.message || t("common.error");
  } finally {
    loading.value = false;
  }
};

const handleTextUpdate = (data) => {
  if (data.updatedText.shareableId === shareableId) {
    isUpdated.value = true;

    text.value = {
      ...text.value,
      title: data.updatedText.title ?? text.value.title,
      content: data.updatedText.content ?? text.value.content,
      updatedAt: data.updatedText.updatedAt ?? text.value.updatedAt,
    };

    setTimeout(() => {
      isUpdated.value = false;
    }, 1000);
  }
};

onMounted(async () => {
  await fetchSharedText();

  if ($socket) {
    if (!$socket.connected) {
      $socket.connect();
    }

    $socket.emit("JOIN_TEXT", { textId: shareableId });
    $socket.on("text-updated", handleTextUpdate);
  }
});

onUnmounted(() => {
  if ($socket) {
    $socket.emit("LEAVE_TEXT", { textId: shareableId });
    $socket.off("text-updated", handleTextUpdate);
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
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

    <div v-else class="bg-white shadow-md rounded-lg p-6">
      <transition name="fade">
        <div v-if="isUpdated" class="update-notification">
          ✨ {{ t("text.updateSuccess") }}
        </div>
      </transition>

      <h1 class="text-3xl font-bold mb-2">
        {{ text?.title || t("text.noTitle") }}
      </h1>
      <div class="flex justify-between items-center text-gray-500 mb-6">
        <span v-if="text?.author"
          >{{ t("text.author") }}: {{ text.author }}</span
        >
        <span v-if="text?.updatedAt">
          {{ t("dashboard.updated") }}:
          {{ new Date(text.updatedAt).toLocaleDateString("pt-BR") }}
        </span>
      </div>

      <transition name="fade">
        <div class="prose max-w-none" v-if="text?.content">
          <p>{{ text.content }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>
