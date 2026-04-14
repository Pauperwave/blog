/**
 * API endpoint to get card data by names
 * GET /api/cards?names=Lightning+Bolt,Counterspell
 */

import { getCardsByNames, closeDatabase } from '../utils/card-database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const namesParam = query.names as string | undefined
  
  if (!namesParam) {
    throw createError({
      statusCode: 400,
      message: 'Missing "names" parameter'
    })
  }
  
  // Parse comma-separated names
  const names = namesParam.split(',').map(n => n.trim()).filter(Boolean)
  
  if (names.length === 0) {
    return { cards: {} }
  }
  
  try {
    // Get cards from database
    const cardsMap = await getCardsByNames(names)
    
    // Transform to response format
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const response: Record<string, any> = {}
    
    for (const [name, card] of cardsMap.entries()) {
      response[name] = {
        name: card.name,
        manaCost: card.manaCost,
        imageUrl: card.imageUrl
      }
    }
    
    return { cards: response }
  } catch (error) {
    console.error('Error fetching cards:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch card data'
    })
  } finally {
    // Close database connection after request (important for serverless)
    closeDatabase()
  }
})
