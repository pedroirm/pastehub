<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "danger", "success"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'px-4 py-2 text-sm': size === 'sm',
        'px-5 py-2.5 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500':
          variant === 'primary',
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400':
          variant === 'secondary',
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
          variant === 'danger',
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500':
          variant === 'success',
        'opacity-75 cursor-not-allowed': disabled,
      },
    ]"
  >
    <template v-if="loading">
      <svg
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </template>
    <slot></slot>
  </button>
</template>
