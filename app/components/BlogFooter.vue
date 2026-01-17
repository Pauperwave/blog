<script lang="ts" setup>
import appMeta from "~/app.meta";
import { PAUPERWAVE_SOCIAL_LINKS } from '~/constants/social-links'

const socialLinks = [
  {
    icon: "i-simple-icons-facebook",
    link: PAUPERWAVE_SOCIAL_LINKS.facebook,
    label: "Facebook"
  },
  {
    icon: "i-simple-icons-instagram",
    link: PAUPERWAVE_SOCIAL_LINKS.instagram,
    label: "Instagram"
  },
  {
    icon: "i-simple-icons-youtube",
    link: PAUPERWAVE_SOCIAL_LINKS.youtube,
    label: "YouTube"
  },
  {
    icon: "i-simple-icons-telegram",
    link: PAUPERWAVE_SOCIAL_LINKS.telegram,
    label: "Telegram"
  },
  {
    icon: "i-simple-icons-github",
    link: PAUPERWAVE_SOCIAL_LINKS.github,
    label: "GitHub"
  }
];
</script>

<template>
  <UFooter
    class="border-t border-t-default"
    :ui="{
      bottom: 'py-0 pb-8 lg:py-0 lg:pb-8'
    }"
  >
    <template #default>
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
          <div>
            <CopyableText
              class="mt-2 h-8 text-nowrap font-mono"
              :content="appMeta.contactEmail"
            />
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
      <UContainer>
        <div class="space-y-8">
          <!-- Originale (senza max-width) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Originale (larghezza piena UContainer)</p>
            <p class="text-xs text-center">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>

          <UDivider />

          <!-- Opzione 1: max-w-4xl (~896px) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Opzione 1: max-w-4xl (~896px)</p>
            <p class="text-xs text-center max-w-4xl mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>

          <UDivider />

          <!-- Opzione 2: max-w-3xl (~768px) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Opzione 2: max-w-3xl (~768px)</p>
            <p class="text-xs text-center max-w-3xl mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>

          <UDivider />

          <!-- Opzione 3: max-w-2xl (~672px) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Opzione 3: max-w-2xl (~672px)</p>
            <p class="text-xs text-center max-w-2xl mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>

          <UDivider />

          <!-- Opzione 4: max-w-xl (~576px) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Opzione 4: max-w-xl (~576px)</p>
            <p class="text-xs text-center max-w-xl mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>

          <UDivider />

          <!-- Opzione 5: max-w-lg (~512px) -->
          <div>
            <p class="text-xs font-bold text-center mb-2">Opzione 5: max-w-lg (~512px)</p>
            <p class="text-xs text-center max-w-lg mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
              aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
              editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
              appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
              non è prodotto, affiliato o supportato dalla Wizards of the Coast.
            </p>
          </div>
        </div>
      </UContainer>
    </template>
  </UFooter>
</template>
