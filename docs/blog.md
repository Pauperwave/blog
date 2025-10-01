In breve:

- Public-facing blog → Static, SEO-optimized, super fast.
- Markdown + @nuxt/content approach for the blog part
- Logged-in part → SSR or CSR with API calls, user-specific content.

Blog

Blog accessibile pubblicamente da `/blog` con le seguenti funzionalità:

- [Dark and Light mode for Nuxt with auto detection](https://nuxt.com/modules/color-mode)
- [Nuxt UI](https://ui.nuxt.com/)
- navigazione degli articoli per categorie e tag
- paginazione degli articoli
- responsive design per la visualizzazione su dispositivi mobili degli articoli
- Tabella dei contenuti con l'utilizzo di [ContentNavigation](https://ui.nuxt.com/docs/components/content-navigation)
- Ricerca degli articoli e ricerca approfondita sul contenuto degli articoli
- ottimizzazione del SEO con l'utilizzo di dati strutturati che rispettano [Schema.org](https://schema.org/) utilizzando Nuxt SEO package.
    - [Official nodes](https://nuxtseo.com/docs/schema-org/guides/nodes)
- Supporto per immagini ottimizzate con [Nuxt Image](https://image.nuxtjs.org/)

Blog backoffice:

- generazione automatica degli articoli del blog da file markdown
- gestione delle categorie e dei tag
- gestione degli autori
- Robots e Sitemap solo per la parte Blog

Gestione associati PauperWave:

- registrazione e login associati
- caricamento di avatar personalizzati

- Invio email di benvenuto
- Invio email di ricevuta per pagamento quota associativa
- Invio email di notifica rinnovo quota associativa
- Invio email di ricevuta per donazioni
- Invio email di ricevuta per iscrizione a eventi

Funzionalità future per gli associati:
- aggiunta carte ricercate pauper/commander
- preregistrazione ai tornei pauper/commander
- aggiunta dei mazzi commander
- statistiche di partecipazione agli eventi
- statistiche sui voti ricevuti per i mazzi commander

Gestione lega commander:

- Creazione, modifica e cancellazione eventi
- Gestione iscritti agli eventi
- Creazione automatica di classifiche in base ai risultati degli eventi
- Statistiche di partecipazione agli eventi
