<script setup lang="ts">
const props = defineProps<{ card: string }>();

const imageUrl = ref<string>("");
const isHovered = ref(false);

onMounted(async () => {
    const res = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
            props.card
        )}`
    );

    if (res.ok) {
        const data = await res.json();
        if (data.image_uris) {
        imageUrl.value = data.image_uris.normal;
        } else if (data.card_faces?.[0]?.image_uris) {
        imageUrl.value = data.card_faces[0].image_uris.normal;
        }
    }
});

    const showPreview = () => { isHovered.value = true }
    const hidePreview = () => { isHovered.value = false }
    </script>

    <template>
    <!-- <span
        class="relative group cursor-pointer text-blue-600 underline"
        role="button"
        tabindex="0"
        @mouseenter="showPreview"
        @mouseleave="hidePreview"
        @focus="showPreview"
        @blur="hidePreview"
    > -->
        {{ card }}
        <!-- <div
            v-if="imageUrl && isHovered"
            class="absolute left-1/2 bottom-full mb-2 z-10 pointer-events-none -translate-x-1/2"
        >
        <img
            :src="imageUrl"
            :alt="card"
            class="w-80 h-auto shadow-lg rounded-lg"
        />
        </div> -->
    <!-- </span> -->
</template>
