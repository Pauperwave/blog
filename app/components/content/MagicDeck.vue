<script setup lang="ts">
import { useSlots, computed, Text } from 'vue'
import type { ParsedCard, Section } from '#shared/types/decklist'

// Define component props - these come from the frontmatter in the MDC syntax
const props = defineProps<{
  name: string
  player?: string
  description?: string
  placement?: string
  tags?: string[]
}>()

// Get access to the component's slots (the content between ::MagicDecklist tags)
const slots = useSlots()

/**
 * Recursively extracts plain text from Vue VNodes
 * Nuxt Content wraps markdown in complex VNode structures, so we need to traverse them
 */
const extractTextFromVNode = (vnode: any): string => {
  // Base case: null or undefined, return empty string
  if (!vnode) return ''
  
  // Case 1: VNode is already a plain string
  if (typeof vnode === 'string') {
    return vnode
  }
  
  // Case 2: VNode has string children (most common for text nodes)
  // Example: { type: 'p', children: 'Some text' }
  if (typeof vnode.children === 'string') {
    return vnode.children
  }
  
  // Case 3: VNode has array of children - recursively process each child
  // Join with newlines to preserve line breaks between elements
  // Example: [{ children: 'Line 1' }, { children: 'Line 2' }]
  if (Array.isArray(vnode.children)) {
    return vnode.children.map(extractTextFromVNode).join('\n')
  }
  
  // Case 4: Text symbol type - Vue's internal representation of text nodes
  if (vnode.type === Text) {
    return vnode.children || ''
  }
  
  // Case 5: Some components store content in props.content
  if (vnode.props?.content) {
    return vnode.props.content
  }
  
  // Case 6: Component with nested slot children
  // Some Nuxt Content components wrap content in a default slot function
  if (vnode.children) {
    // Already handled string children above, so this is for objects
    if (typeof vnode.children === 'string') {
      return vnode.children
    }
    // Check if children is an object with a 'default' slot
    if (typeof vnode.children === 'object' && vnode.children.default) {
      const slotFn = vnode.children.default
      // If it's a function, call it to get the VNodes
      if (typeof slotFn === 'function') {
        const slotVNodes = slotFn()
        // Recursively process the returned VNodes
        return Array.isArray(slotVNodes) 
          ? slotVNodes.map(extractTextFromVNode).join('\n')
          : extractTextFromVNode(slotVNodes)
      }
    }
  }
  
  // No text found in this VNode
  return ''
}

/**
 * Parses the raw text into structured card data
 * Expected format:
 *   Section Name
 *   4 Card Name
 *   2 Another Card
 *   Next Section
 *   ...
 */
const parseDecklist = (rawText: string): ParsedCard[] => {
  // Step 1: Split text into lines and clean them up
  const lines = rawText
    .split('\n')  // Split on newlines
    .flatMap(line => {
      // Handle edge case where cards are concatenated without newlines
      // Example: "4 Fungal ColossusInstants" -> ["4 Fungal Colossus", "Instants"]
      // Regex splits when lowercase letter is followed by uppercase letter
      return line.split(/(?<=[a-z])(?=[A-Z][a-z])/)
    })
    .map(line => line.trim())  // Remove whitespace from both ends
    .filter(Boolean)  // Remove empty lines
  
  const cards: ParsedCard[] = []
  
  // Step 2: Define mapping from section names (as they appear in markdown) to our types
  // We only use plural forms since that's the standard in Magic decklists
  const sectionMap: Record<string, Section | 'Sideboard'> = {
    'Creatures': 'Creature',
    'Instants': 'Instant',
    'Sorceries': 'Sorcery',
    'Artifacts': 'Artifact',
    'Enchantments': 'Enchantment',
    'Lands': 'Land',
    'Sideboard': 'Sideboard',
  }
  
  // Step 3: Initialize state for tracking current section
  let currentSection: Section | 'Sideboard' = 'Creature'  // Default to Creature, can also be 'Sideboard'
  
  // Step 4: Process each line - single pass through the data
  for (const line of lines) {
    // Check if this line is a known section header
    if (sectionMap[line]) {
      currentSection = sectionMap[line]  // Update current section (including Sideboard)
      continue  // Move to next line
    }
    
    // Try to match card pattern: number followed by space and card name
    // Example: "4 Lightning Bolt" -> groups: ["4", "Lightning Bolt"]
    const cardMatch = line.match(/^(\d+)\s+(.+)$/)
    
    if (cardMatch) {
      // This line is a card entry
      const [, quantityStr, name] = cardMatch  // Destructure: full match, quantity, name
      
      cards.push({
        quantity: parseInt(quantityStr, 10),  // Convert string to number
        name: name.trim(),  // Card name (trim any extra whitespace)
        section: currentSection as Section  // What section does it belong to?
      })
    }
    // If line doesn't match any pattern, it's ignored (could be empty or malformed)
  }
  
  return cards
}

/**
 * Combined computed that does both parsing and grouping in one pass
 * More performant than having two separate computed properties
 */
const cardsBySection = computed(() => {
  // Get the default slot content (returns array of VNodes or undefined)
  const slotContent = slots.default?.()
  if (!slotContent) return {}
  
  // Extract plain text from all VNodes and join with newlines
  const rawText = slotContent.map(extractTextFromVNode).join('\n')
  
  // Parse the text into structured card data
  const cards = parseDecklist(rawText)
  
  // Group cards by section in the same pass
  const grouped: Record<string, ParsedCard[]> = {}
  
  for (const card of cards) {
    const section = card.section
    
    // Initialize array for this section if it doesn't exist, otherwise push directly
    if (!grouped[section]) {
      grouped[section] = [card]
    } else {
      grouped[section].push(card)
    }
  }
  
  return grouped
})

// Expose parsedCards as a computed derived from cardsBySection if you still need it
// const parsedCards = computed(() => {
//   return Object.values(cardsBySection.value).flat()
// })
</script>

<template>
  <div class="decklist">
    <!-- Header section with deck metadata -->
    <div class="decklist-header">
      <h3>{{ name }}</h3>
      <div v-if="player" class="player">Player: {{ player }}</div>
      <div v-if="placement" class="placement">{{ placement }}</div>
    </div>
    
    <!-- Render parsed cards grouped by section -->
    <div v-if="Object.keys(cardsBySection).length > 0" class="decklist-sections">
      <!-- Loop through each section (Creature, Instant, etc.) -->
      <div v-for="(cards, section) in cardsBySection" :key="section" class="section">
        <h4>{{ section }}</h4>
        <ul>
          <!-- Loop through each card in this section -->
          <li v-for="(card, idx) in cards" :key="idx">
            {{ card.quantity }} {{ card.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
