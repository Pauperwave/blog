## 🏗 Nuxt 3 API Documentation

API endpoints are located in the `server/api` directory.
This document describes the server-side API structure for the Nuxt 4 project, using a RESTful, flatter design and organized under `/server/api/`.

The API uses Nuxt 3 file-based routing with TypeScript handlers.

### 📂 Folder Structure

```
server/api/v1/
├── leagues/
│   ├── index.get.ts        # GET /leagues
│   ├── index.post.ts       # POST /leagues
│   └── [id].delete.ts      # DELETE /leagues/:id
│
├── associates/
│   ├── index.get.ts        # GET /associates
│   ├── index.post.ts       # POST /associates
│   ├── [id].get.ts         # GET /associates/:id
│   ├── [id].patch.ts       # PATCH /associates/:id
│   └── [id].delete.ts      # DELETE /associates/:id
│
├── events/
│   ├── index.get.ts                   # GET /events
│   ├── index.post.ts                  # POST /events
│   ├── [id].get.ts                    # GET /events/:id
│   ├── [id].patch.ts                  # PATCH /events/:id
│   └── [id].delete.ts                 # DELETE /events/:id
│   └── [id]/tournaments.index.get.ts  # GET /events/:id/tournaments
│   └── [id]/tournaments.index.post.ts # POST /events/:id/tournaments
│
├── tournaments/
│   ├── index.get.ts        # GET /tournaments?eventId=...
│   ├── index.post.ts       # POST /tournaments
│   ├── [id].get.ts         # GET /tournaments/:id
│   ├── [id].patch.ts       # PATCH /tournaments/:id
│   └── [id].delete.ts      # DELETE /tournaments/:id
│
├── rounds/
│   ├── index.get.ts        # GET /rounds?tournamentId=...
│   ├── [id].get.ts         # GET /rounds/:id
│   ├── [id].patch.ts       # PATCH /rounds/:id
│   └── [id].delete.ts      # DELETE /rounds/:id
│
├── pairings/
│   ├── index.get.ts        # GET /pairings?roundId=...
│   └── [id].get.ts         # GET /pairings/:id
│
├── positions/
│   └── index.get.ts        # GET /positions?roundId=...
│
├── results/
│   └── index.post.ts       # POST /results
│
├── scores/
│   ├── index.post.ts       # POST /scores
│   └── [id].put.ts         # PUT /scores/:id
│
├── players/
│   ├── index.get.ts        # GET /players
│   └── index.post.ts       # POST /players
│
├── rulesets/
│   └── index.get.ts        # GET /rulesets
│
└── archetypes/
    └── index.get.ts        # GET /archetypes
```

### 🔹 Endpoints Overview