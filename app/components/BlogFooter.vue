<template>
  <UFooter
    :ui="{
      top: 'py-8 border-t-2 border-white',
      bottom: 'py-4'
    }"
  >
    <template #top>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <!-- Brand & Social Section -->
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 class="text-2xl font-bold text-white mb-2">
            Pauperwave APS
          </h3>
          <div class="flex gap-2 flex-wrap justify-center md:justify-start">
            <UButton
              to="https://facebook.com/pauperwave"
              target="_blank"
              icon="i-simple-icons-facebook"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Facebook"
            />
            <UButton
              to="https://instagram.com/pauperwave"
              target="_blank"
              icon="i-simple-icons-instagram"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Instagram"
            />
            <UButton
              to="https://youtube.com/@pauperwave"
              target="_blank"
              icon="i-simple-icons-youtube"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="YouTube"
            />
            <UButton
              to="https://x.com/pauperwave"
              target="_blank"
              icon="i-simple-icons-x"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="X"
            />
            <UButton
              to="https://t.me/pauperwave"
              target="_blank"
              icon="i-simple-icons-telegram"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Telegram"
            />
          </div>
        </div>

        <!-- Company Info Section -->
        <div class="text-white text-sm leading-relaxed text-center md:text-left">
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
            class="text-white underline"
          />
          <UButton
            to="#"
            label="Privacy Policy"
            color="neutral"
            variant="link"
            class="text-white underline"
          />
        </div>
      </div>
    </template>

    <template #bottom>
      <p class="text-xs text-center text-white">
        Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
        aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
        editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
        appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
        non è prodotto, affiliato o supportato dalla Wizards of the Coast.
      </p>
    </template>
  </UFooter>
</template>
