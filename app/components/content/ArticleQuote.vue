<template>
  <UCard 
    variant="subtle" 
    :ui="{ 
      root: 'border-l-4 border-primary bg-elevated/50 my-6',
      body: 'p-6' 
    }"
  >
    <div class="flex flex-col gap-4">
      <UIcon 
        name="i-lucide-quote" 
        class="text-primary size-8 opacity-50"
      />
      <blockquote class="text-lg font-medium text-highlighted italic [&>p]:my-2 [&>p]:first:mt-0 [&>p]:last:mb-0">
        <slot />
      </blockquote>
    </div>
  </UCard>
</template>
