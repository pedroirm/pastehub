<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-16">
      <div class="flex flex-col items-center">
        <h1 class="text-4xl font-bold text-center mb-6">
          {{ $t("common.welcome") }}
        </h1>
        <p class="text-xl text-gray-600 text-center max-w-3xl mb-10">
          {{ $t("home.subtitle") }}
        </p>

        <div class="flex space-x-4">
          <NuxtLink to="/auth/login">
            <Button variant="primary" size="lg">{{
              $t("home.getStarted")
            }}</Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
