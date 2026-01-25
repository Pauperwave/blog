<template>
  <client-only v-if="!colorMode?.forced">
    <USwitch
      v-model="isDark"
      checked-icon="i-lucide-moon"
      unchecked-icon="i-lucide-sun"
      color="neutral"
      size="sm"
    />
    <template #fallback>
      <div class="size-8" />
    </template>
  </client-only>
</template>
<script lang="ts" setup>
const colorMode = useColorMode();

const isDark = computed({
  get() {
      return colorMode.value === "dark";
  },
  set(_isDark) {
      colorMode.preference = _isDark ? "dark" : "light";
  },
});
</script>
