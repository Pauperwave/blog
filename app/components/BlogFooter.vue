<template>
  <footer class="footer-container">
    <div class="footer-content">
      <div class="footer-section brand-social">
        <h3 class="brand-name">Pauperwave APS</h3>
        <div class="social-icons">
          <NuxtLink to="https://facebook.com/pauperwave" target="_blank" rel="noopener noreferrer"
            aria-label="Facebook">
            <Icon name="fa7-brands:facebook" />
          </NuxtLink>
          <NuxtLink to="https://instagram.com/pauperwave" target="_blank" rel="noopener noreferrer"
            aria-label="Instagram">
            <Icon name="fa7-brands:instagram" />
          </NuxtLink>
          <NuxtLink to="https://youtube.com/@pauperwave" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <Icon name="fa7-brands:youtube" />
          </NuxtLink>
          <NuxtLink to="https://x.com/pauperwave" target="_blank" rel="noopener noreferrer" aria-label="X">
            <Icon name="fa7-brands:x-twitter" />
          </NuxtLink>
          <NuxtLink to="https://t.me/pauperwave" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <Icon name="fa7-brands:telegram" />
          </NuxtLink>
        </div>
      </div>

      <div class="footer-section company-info">
        <p>Pauperwave APS</p>
        <p>Associazione di Promozione Sociale</p>
        <p>Sede: via Benacense II, n. 77/bis</p>
        <p>Rovereto | Trentino A.A.</p>
        <p>C.F. 94047330223</p>
      </div>

      <div class="footer-section legal-links">
        <NuxtLink to="#">Cookie Policy</NuxtLink>
        <NuxtLink to="#">Privacy Policy</NuxtLink>
      </div>
    </div>
    <p class="text-xs text-center">
      Pauperwave non costituisce testata giornalistica e non ha carattere periodico essendo
      aggiornato secondo disponibilità degli autori. Pertanto non può essere considerato in alcun modo un prodotto
      editoriale ai sensi della L. n. 62 del 7/3/2001. Il copyright di tutte le carte presentate su questo sito
      appartiene alla Wizards of the Coast. Le immagini delle carte sono recuperate dal sito deckbox.org. Questo sito
      non è prodotto, affiliato o supportato dalla Wizards of the Coast.
    </p>
  </footer>
</template>

<style scoped>
.footer-container {
  margin-top: 20px;
  border-top: 2px solid white;
  padding: 20px;
  /* background-color: white; */
  color: white;
  font-family: Arial, sans-serif;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .legal-links {
    align-items: center;
  }
}

.footer-section {
  flex: 1;
  padding: 10px;
}

.footer-disclaimer {
  color: white;
}

.brand-social {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.5em;
  margin-bottom: 10px;
  font-weight: 700;
}

.social-icons {
  display: flex;
  flex-wrap: wrap;
}

.social-icons a {
  color: white;
  margin-right: 15px;
  font-size: 1.2em;
  text-decoration: none;
}

.company-info p {
  margin: 5px 0;
  font-size: 0.9em;
  line-height: 1.4;
}

.legal-links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.legal-links a {
  color: white;
  text-decoration: underline;
  margin-bottom: 5px;
  font-size: 0.9em;
}
</style>
