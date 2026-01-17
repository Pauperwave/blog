<script lang="ts" setup>
const socialLinks = [
  {
    icon: "i-simple-icons-facebook",
    link: "https://facebook.com/pauperwave",
    label: "Facebook"
  },
  {
    icon: "i-simple-icons-instagram",
    link: "https://instagram.com/pauperwave_official",
    label: "Instagram"
  },
  {
    icon: "i-simple-icons-youtube",
    link: "https://youtube.com/@pauperwave",
    label: "YouTube"
  },
  {
    icon: "i-simple-icons-x",
    link: "https://x.com/pauperwave",
    label: "X"
  },
  {
    icon: "i-simple-icons-telegram",
    link: "https://t.me/pauperwave_official",
    label: "Telegram"
  }
];
</script>

<template>
  <UFooter
    :ui="{
      top: 'border-t-2 border-gray-900 dark:border-white'
    }"
  >
    <template #top>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <!-- Brand & Social Section -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class="text-2xl font-bold mb-2">
            Pauperwave APS
          </h3>
          <div class="flex gap-2 flex-wrap justify-center md:justify-start">
            <div class="flex gap-2 flex-wrap justify-center md:justify-start">
              <UButton
                v-for="(social, index) in socialLinks"
                :key="index"
                :icon="social.icon"
                color="neutral"
                variant="ghost"
                :to="social.link"
                target="_blank"
                size="sm"
                :aria-label="social.label"
              />
            </div>
          </div>
        </div>

        <!-- Company Info Section -->
        <div class="text-sm leading-relaxed text-center md:text-left">
          <p>Pauperwave APS</p>
          <p>Associazione di Promozione Sociale</p>
          <p>Sede: via Benacense II, n. 77/bis</p>
          <p>Rovereto | Trentino A.A.</p>
          <p>C.F. 94047330223</p>
        </div>

        <!-- Legal Links Section -->
        <div class="flex flex-col text-sm items-center md:items-end justify-center md:justify-start text-center md:text-right">
          <UButton
            to="#"
            label="Cookie Policy"
            color="neutral"
            variant="link"
            class="underline"
          />
          <UButton
            to="#"
            label="Privacy Policy"
            color="neutral"
            variant="link"
            class="underline"
          />
        </div>
      </div>
    </template>

    <template #bottom>
      <p class="text-xs text-center">
        Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
        aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
        editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
        appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
        non è prodotto, affiliato o supportato dalla Wizards of the Coast.
      </p>
    </template>
  </UFooter>
</template>
