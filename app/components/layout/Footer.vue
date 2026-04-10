<script setup lang="ts">
import appMeta from "~/app.meta"
import { PAUPERWAVE_SOCIAL_LINKS } from '~/constants/social-links'

const footerSocialLinks = [
  {
    icon: 'i-simple-icons-facebook',
    label: 'Facebook',
    link: PAUPERWAVE_SOCIAL_LINKS.facebook
  },
  {
    icon: 'i-simple-icons-instagram',
    label: 'Instagram',
    link: PAUPERWAVE_SOCIAL_LINKS.instagram
  },
  {
    icon: 'i-simple-icons-youtube',
    label: 'YouTube',
    link: PAUPERWAVE_SOCIAL_LINKS.youtube
  },
  {
    icon: 'i-simple-icons-telegram',
    label: 'Telegram',
    link: PAUPERWAVE_SOCIAL_LINKS.telegram
  },
  {
    icon: 'i-simple-icons-github',
    label: 'GitHub',
    link: PAUPERWAVE_SOCIAL_LINKS.github
  }
]
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
                v-for="(social, index) in footerSocialLinks"
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
          <p>Sede: Viale Trento, 77</p>
          <p>Rovereto | Trentino A.A.</p>
          <p>C.F. 94047330223</p>
        </div>

        <!--  -->
        <!-- Legal Links Section -->
        <div
          class="flex flex-col text-sm items-center md:items-end justify-center md:justify-start text-center md:text-right gap-1"
        >
          <NuxtLink
            to="/docs/codice-di-condotta"
            color="neutral"
            variant="link"
            class="underline py-1.5 px-2 min-h-[44px] flex items-center"
          >
            Codice di Condotta
          </NuxtLink>
          <NuxtLink
            to="/docs/statuto"
            color="neutral"
            variant="link"
            class="underline py-1.5 px-2 min-h-[44px] flex items-center"
          >
            Statuto dell'Associazione
          </NuxtLink>
          <NuxtLink
            to="https://pauperwave.org"
            color="neutral"
            variant="link"
            class="underline py-1.5 px-2 min-h-[44px] flex items-center"
          >
            Chi siamo
          </NuxtLink>
          <NuxtLink
            to="https://tinyurl.com/adesione-pauperwave"
            color="neutral"
            variant="link"
            class="underline py-1.5 px-2 min-h-[44px] flex items-center"
          >
            Associati ora
          </NuxtLink>
        </div>
      </div>
    </template>

    <template #bottom>
      <UContainer>
        <div class="space-y-8">

          <!-- Opzione 3: max-w-2xl (~672px) -->
          <div>
            <p class="text-xs text-center max-w-2xl mx-auto">
              Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto editoriale ai sensi della <ULink to="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2001-03-07;62" target="_blank" class="underline">L. n. 62 del 7/3/2001</ULink>.

              Il copyright di tutte le carte presentate su questo sito appartiene alla <ULink to="https://company.wizards.com/" target="_blank" class="underline">Wizards of the Coast</ULink>.

              Le immagini delle carte sono recuperate da <ULink to="https://scryfall.com" target="_blank" class="underline">Scryfall</ULink>. Questo sito non è prodotto, affiliato o supportato dalla <ULink to="https://company.wizards.com/" target="_blank" class="underline">Wizards of the Coast</ULink>.
            </p>
          </div>
        </div>
      </UContainer>
    </template>
  </UFooter>
</template>
