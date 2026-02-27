# Project State Analysis: Card Download & Database Flow

I've analyzed your Magic: The Gathering project. Here's the complete flow of card downloading and database creation:

## **Architecture Overview**

This is a Nuxt 3 application that downloads Magic: The Gathering card data from Scryfall and stores it locally in a SQLite database for fast lookups.

---

## **Card Download Flow**

**Entry Point:** `scripts/download-bulk-data.ts`

**Step-by-step process:**

1. **Fetch Bulk Data Info** (line 70-86)
   - Calls Scryfall API: `https://api.scryfall.com/bulk-data`
   - Finds "oracle_cards" bulk data type
   - Returns download URI and metadata

2. **Download Bulk Data** (line 88-109)
   - Creates `./server/database/` directory if needed
   - Downloads compressed JSON from Scryfall
   - Saves to: `./server/database/oracle-cards.json` (~168 MB)

3. **Create Database Schema** (line 111-141)
   - Creates SQLite database: `./server/database/cards.db`
   - Creates 2 tables:
      - `cards`: name (PK), mana_cost, image_url, indexed_at
      - `metadata`: key (PK), value, updated_at
   - Creates index on `cards.name`

4. **Import Pauper Cards** (line 151-205)
   - Reads `oracle-cards.json`
   - Filters for Pauper-legal cards (legalities.pauper === 'legal')
   - Handles double-faced cards (extracts first face mana cost/image)
   - Batch inserts using transaction (~1953 KB final DB)
   - Stores metadata: last_update, total_cards

**Trigger Points:**
- Manual: `bun run download-cards`
- Automatic: `prebuild` and `pregenerate` hooks (package.json:13-14)

---

## **Database Access Flow**

**Utility:** `server/utils/card-database.ts`

**Key Functions:**

1. **getDatabase()** (line 28-34)
   - Singleton pattern for DB connection
   - Opens in read-only mode
   - Path: `server/database/cards.db`

2. **getCardByName(name)** (line 49-63)
   - Single card lookup by exact name

3. **getCardsByNames(names[])** (line 68-87)
   - Batch lookup with parameterized query
   - Returns `Map<name, CardData>`
   - Used by API endpoint for efficiency

---

## **API Layer**

**Endpoint:** `server/api/cards.get.ts`

**Request:** `GET /api/cards?names=Lightning+Bolt,Counterspell`

**Response:**
```json
{
   "cards": {
      "Lightning Bolt": {
         "name": "Lightning Bolt",
         "manaCost": "{R}",
         "imageUrl": "https://..."
      }
   }
}
```

**Flow:**
1. Receives comma-separated card names
2. Calls `getCardsByNames()` for batch lookup
3. Returns structured JSON

---

## **Frontend Integration**

**Component:** `app/components/content/MagicDecklist.vue`

**Flow:**

1. **Parse Decklist** (line 250-284)
   - Extracts headings and card lines from slot content
   - Pattern: "4 Lightning Bolt" or "- 4 Lightning Bolt"

2. **Fetch Card Data** (line 289-316)
   - Collects all unique card names
   - Calls `/api/cards` with batch of names
   - Caches results in `cardDataCache`

3. **Render Sections** (line 321-400)
   - Builds main deck and sideboard sections
   - Enriches each card with mana symbols + images
   - Displays in 3-column grid (main/side/preview)

4. **Interactive Features:**
   - Hover to preview card image (desktop)
   - Click to show modal (mobile)
   - Copy decklist to clipboard (MTGO format)

**Component:** `app/components/content/MagicCardDisplay.vue`
- Simpler component for single card display
- Fetches directly from Scryfall API (not local DB)
- Supports set/collector number syntax

---

## **Data Flow Summary**

```
Scryfall API → download-bulk-data.ts → oracle-cards.json (168 MB)
                                    ↓
                              cards.db (1.95 MB, Pauper only)
                                    ↓
                     card-database.ts (utilities)
                                    ↓
                        /api/cards (endpoint)
                                    ↓
                        MagicDecklist.vue (frontend)
```

---

## **Current State**

- ✅ Database exists: `server/database/cards.db` (1.95 MB)
- ✅ Temp file exists: `server/database/oracle-cards.json` (168 MB)
- ✅ Build hooks configured: prebuild/pregenerate run download script
- ✅ API endpoint functional: `/api/cards`
- ✅ Components integrated: MagicDecklist, MagicCardDisplay
- ✅ Efficient batch lookups and caching implemented
- ✅ Pauper legality filtering applied during import
- ✅ Mana symbols rendered with CSS (`mana-font`) on the frontend
- ✅ Interactive UI features for card preview and decklist copying
