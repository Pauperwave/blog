import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import appMeta from '~/app.meta'

export const useArticleMeta = (
  data: Ref<AnyArticle | null | undefined>,
  authorsData: Ref<Author[] | null | undefined>
) => {
  useSchemaOrg([
    defineArticle({
      headline: data.value?.title,
      description: data.value?.description,
      image: data.value?.thumbnail,
      keywords: data.value?.tags,
      author: {
        name: authorsData.value?.[0]?.name,
        description: authorsData.value?.[0]?.description,
        image: authorsData.value?.[0]?.avatar,
      },
      publisher: definePerson({
        name: appMeta.author.name,
        description: appMeta.author.description,
        image: appMeta.author.image,
        url: appMeta.author.url,
      }),
    }),
  ])

  useSeoMeta({
    title: data.value?.title,
    description: data.value?.description,
    ogImage: data.value?.thumbnail,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterImage: data.value?.thumbnail,
  })

  defineOgImageComponent('Article', {
    thumbnail: data.value?.thumbnail,
    title: data.value?.title,
    author: {
      name: authorsData.value?.[0]?.name,
      image: authorsData.value?.[0]?.avatar,
    },
  })
}
