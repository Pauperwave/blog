# Spec: Bottone Editor nell'Header

## Overview
Aggiungere un pulsante "Editor" nell'header del sito per permettere l'accesso rapido alla sezione di editing dei contenuti.

## Posizione
- File: `app/components/layout/Header.vue`
- Template section: `#right` (accanto a `ColorModeButton`)

## Design

### Componente
- Tipo: `UButton` di Nuxt UI
- Icona: `i-lucide-pencil` (matita)
- Label: "Editor"
- Link: `/editor`
- Variante: `ghost`
- Colore: `neutral`

### Visibilità
- Desktop (md e oltre): visibile con icona + label "Editor"
- Mobile/Tablet: nascosto (`hidden md:flex`)

## Implementazione

```vue
<UButton
  icon="i-lucide-pencil"
  label="Editor"
  to="/editor"
  variant="ghost"
  color="neutral"
  class="hidden md:flex"
/>
```

## Dipendenze
- Nessuna nuova dipendenza richiesta
- Icona `i-lucide-pencil` già disponibile nella configurazione Nuxt Icon

## Comportamento
- Click: naviga a `/editor`
- Il route `/editor` è configurato con SSR nel nuxt.config.ts