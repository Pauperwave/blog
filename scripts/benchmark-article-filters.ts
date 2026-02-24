import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';

type Category = 'decklist' | 'article' | 'report' | 'spoiler' | 'tutorial';
type DatasetMode = 'content' | 'synthetic';

interface BenchmarkArticle {
  id: number
  path: string
  category: Category
  author: string
  date?: string
  locations?: unknown
  tags?: unknown
}

interface BenchmarkAuthor {
  name: string
}

interface FilterQuery {
  category: string | null
  author: string | null
  location: string | null
  tag: string | null
}

interface PreparedArticleFilterData {
  article: BenchmarkArticle
  authorSlug: string
  normalizedLocationSet: Set<string>
  topicTags: string[]
  normalizedTopicTagSet: Set<string>
}

interface OptimizedPreparedState {
  prepared: PreparedArticleFilterData[]
  lookup: Map<BenchmarkArticle, PreparedArticleFilterData>
  counts: {
    categoryCounts: Record<string, number>
    authorCounts: Record<string, number>
    locationCounts: Record<string, number>
    tagCounts: Record<string, number>
  }
}

const CATEGORY_LABELS: Record<Category, string> = {
  decklist: 'Decklist',
  article: 'Articoli',
  report: 'Report',
  spoiler: 'Spoiler',
  tutorial: 'Tutorial'
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const CONTENT_COLLECTIONS: Array<{ folder: string; category: Category }> = [
  { folder: 'decklists', category: 'decklist' },
  { folder: 'articles', category: 'article' },
  { folder: 'reports', category: 'report' },
  { folder: 'spoilers', category: 'spoiler' },
  { folder: 'tutorials', category: 'tutorial' }
];

const DEFAULTS = {
  mode: 'content' as DatasetMode,
  seed: 42,
  articles: 8000,
  authors: 350,
  locations: 90,
  tags: 260,
  queries: 300,
  rounds: 5,
  limit: 0
} as const;

const normalizeFilterValue = (value: string) => value.trim().toLocaleLowerCase('it');
const getAuthorSlug = (authorName: string) => authorName.toLowerCase().replace(/\s+/g, '-');

const getStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const hashMix = (hash: number, value: number) => (((hash * 31) >>> 0) + (value >>> 0)) >>> 0;

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const randInt = (rng: () => number, maxExclusive: number) => Math.floor(rng() * maxExclusive);

const sampleUnique = <T>(rng: () => number, pool: T[], count: number): T[] => {
  if (count <= 0) return [];
  if (count >= pool.length) return [...pool];

  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(randInt(rng, pool.length));
  }

  return [...picked].map(index => pool[index]);
};

const parseArgs = () => {
  const args = { ...DEFAULTS };
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.slice(2).split('=');
    const key = rawKey as keyof typeof args;
    const nextValue = inlineValue ?? argv[i + 1];

    if (!(key in args) || !nextValue) continue;

    if (key === 'mode') {
      if (nextValue === 'content' || nextValue === 'synthetic') {
        args.mode = nextValue;
      }

      if (inlineValue === undefined) i += 1;
      continue;
    }

    const parsed = Number.parseInt(nextValue, 10);
    const minValue = key === 'limit' ? 0 : 1;
    if (Number.isNaN(parsed) || parsed < minValue) continue;

    args[key] = parsed as never;

    if (inlineValue === undefined) i += 1;
  }

  return args;
};

const walkMarkdownFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];

  for (const pattern of ['**/*.md', '**/*.mdc']) {
    const glob = new Bun.Glob(pattern);

    for await (const relativePath of glob.scan({ cwd: dir })) {
      files.push(join(dir, relativePath));
    }
  }

  return files;
};

const extractFrontmatter = (source: string): Record<string, unknown> | null => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const parsed = parseYaml(match[1]);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  return parsed as Record<string, unknown>;
};

const parseDateTimestamp = (value: unknown) => {
  if (typeof value !== 'string' && !(value instanceof Date)) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const createArticlePathFromFile = (collectionDir: string, filePath: string) => {
  const relativePath = relative(collectionDir, filePath).split(sep).join('/');
  const withoutExt = relativePath.replace(/\.(md|mdc)$/i, '');
  const normalized = withoutExt.replace(/\/index$/i, '');
  return `/articles/${normalized}`;
};

const loadPublishedArticlesFromContent = async (config: ReturnType<typeof parseArgs>) => {
  const contentRoot = join(process.cwd(), 'content', 'blog');
  const rawArticles: Array<Omit<BenchmarkArticle, 'id'>> = [];

  for (const collection of CONTENT_COLLECTIONS) {
    const collectionDir = join(contentRoot, collection.folder);
    const files = await walkMarkdownFiles(collectionDir);

    for (const filePath of files) {
      const source = await Bun.file(filePath).text();
      const frontmatter = extractFrontmatter(source);
      if (!frontmatter) continue;

      const published = typeof frontmatter.published === 'boolean' ? frontmatter.published : false;
      if (!published) continue;

      const author = typeof frontmatter.author === 'string' ? frontmatter.author : 'Unknown';
      const date = typeof frontmatter.date === 'string'
        ? frontmatter.date
        : frontmatter.date instanceof Date
          ? frontmatter.date.toISOString()
          : undefined;

      rawArticles.push({
        path: createArticlePathFromFile(collectionDir, filePath),
        category: collection.category,
        author,
        date,
        locations: frontmatter.locations,
        tags: frontmatter.tags
      });
    }
  }

  rawArticles.sort((a, b) => parseDateTimestamp(b.date) - parseDateTimestamp(a.date));

  const limited = config.limit > 0 ? rawArticles.slice(0, config.limit) : rawArticles;

  const articles: BenchmarkArticle[] = limited.map((article, index) => ({
    id: index + 1,
    ...article
  }));

  const authorsMap = articles.reduce((acc, article) => {
    if (!acc[article.author]) {
      acc[article.author] = { name: article.author };
    }
    return acc;
  }, {} as Record<string, BenchmarkAuthor>);

  return { articles, authorsMap };
};

const generateSyntheticDataset = (config: ReturnType<typeof parseArgs>) => {
  const rng = createRng(config.seed);

  const authorKeys = Array.from({ length: config.authors }, (_, i) => `author-${String(i + 1).padStart(3, '0')}`);
  const authorsMap = authorKeys.reduce((acc, key, index) => {
    acc[key] = { name: `Author ${String(index + 1).padStart(3, '0')}` };
    return acc;
  }, {} as Record<string, BenchmarkAuthor>);

  const locationPool = Array.from({ length: config.locations }, (_, i) => `Location ${i + 1}`);
  const tagPool = Array.from({ length: config.tags }, (_, i) => `Tag ${i + 1}`);

  const articles: BenchmarkArticle[] = Array.from({ length: config.articles }, (_, index) => {
    const locations = sampleUnique(rng, locationPool, 1 + randInt(rng, 3));
    const topicTags = sampleUnique(rng, tagPool, 2 + randInt(rng, 5));
    const tags = [...topicTags];

    if (rng() < 0.35) {
      tags.push(locations[randInt(rng, locations.length)]);
    }

    if (rng() < 0.15) {
      tags.push(`Meta ${1 + randInt(rng, 12)}`);
    }

    return {
      id: index + 1,
      path: `/articles/${index + 1}`,
      category: CATEGORIES[randInt(rng, CATEGORIES.length)],
      author: authorKeys[randInt(rng, authorKeys.length)],
      locations,
      tags
    };
  });

  const authorSlugs = authorKeys.map(key => getAuthorSlug(authorsMap[key].name));

  const queries: FilterQuery[] = Array.from({ length: config.queries }, () => {
    const useCategory = rng() < 0.45;
    const useAuthor = rng() < 0.25;
    const useLocation = rng() < 0.3;
    const useTag = rng() < 0.3;

    return {
      category: useCategory ? CATEGORIES[randInt(rng, CATEGORIES.length)] : null,
      author: useAuthor ? authorSlugs[randInt(rng, authorSlugs.length)] : null,
      location: useLocation ? locationPool[randInt(rng, locationPool.length)] : null,
      tag: useTag ? tagPool[randInt(rng, tagPool.length)] : null
    };
  });

  return { articles, authorsMap, queries };
};

const buildQueriesFromContentDataset = (
  articles: BenchmarkArticle[],
  authorsMap: Record<string, BenchmarkAuthor>,
  config: ReturnType<typeof parseArgs>
) => {
  const rng = createRng(config.seed);

  const categoryPool = [...new Set(articles.map(article => article.category))];
  const authorSlugPool = Object.values(authorsMap).map(author => getAuthorSlug(author.name));
  const locationPool = [...new Set(
    articles.flatMap(article => getStringArray(article.locations))
  )];
  const tagPool = [...new Set(
    articles.flatMap(article => getArticleTopicTagsLegacy(article))
  )];

  const queries: FilterQuery[] = Array.from({ length: config.queries }, () => ({
    category: categoryPool.length && rng() < 0.45 ? categoryPool[randInt(rng, categoryPool.length)] : null,
    author: authorSlugPool.length && rng() < 0.25 ? authorSlugPool[randInt(rng, authorSlugPool.length)] : null,
    location: locationPool.length && rng() < 0.3 ? locationPool[randInt(rng, locationPool.length)] : null,
    tag: tagPool.length && rng() < 0.3 ? tagPool[randInt(rng, tagPool.length)] : null
  }));

  return {
    queries,
    stats: {
      authors: authorSlugPool.length,
      locations: locationPool.length,
      tags: tagPool.length
    }
  };
};

const generateDataset = async (config: ReturnType<typeof parseArgs>) => {
  if (config.mode === 'synthetic') {
    return generateSyntheticDataset(config);
  }

  const { articles, authorsMap } = await loadPublishedArticlesFromContent(config);
  const { queries } = buildQueriesFromContentDataset(articles, authorsMap, config);
  return { articles, authorsMap, queries };
};

const getArticleTopicTagsLegacy = (article: BenchmarkArticle) => {
  const normalizedLocationSet = new Set(getStringArray(article.locations).map(location => normalizeFilterValue(location)));
  return getStringArray(article.tags).filter(tag => !normalizedLocationSet.has(normalizeFilterValue(tag)));
};

const buildLegacyFilterOptions = (articles: BenchmarkArticle[], authorsMap: Record<string, BenchmarkAuthor>) => {
  const categoryFilterOptions = Object.entries(CATEGORY_LABELS).map(([category, label]) => ({
    category,
    label,
    count: articles.filter(article => article.category === category).length
  }));

  const locationCounts = articles.reduce((acc, article) => {
    getStringArray(article.locations).forEach((location) => {
      acc[location] = (acc[location] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const locationFilterOptions = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.location.localeCompare(b.location, 'it')));

  const authorCounts = articles.reduce((acc, article) => {
    acc[article.author] = (acc[article.author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const authorFilterOptions = Object.entries(authorCounts)
    .map(([authorKey, count]) => {
      const authorName = authorsMap[authorKey]?.name || authorKey;
      return {
        name: authorName,
        slug: getAuthorSlug(authorName),
        count
      };
    })
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name, 'it')));

  const tagCounts = articles.reduce((acc, article) => {
    getArticleTopicTagsLegacy(article).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const tagFilterOptions = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.tag.localeCompare(b.tag, 'it')));

  return { categoryFilterOptions, locationFilterOptions, authorFilterOptions, tagFilterOptions };
};

const filterArticlesLegacy = (
  articles: BenchmarkArticle[],
  authorsMap: Record<string, BenchmarkAuthor>,
  query: FilterQuery
) => {
  return articles.filter((article) => {
    const matchesCategory = !query.category || article.category === query.category;
    const authorName = authorsMap[article.author]?.name || article.author;
    const matchesAuthor = !query.author || getAuthorSlug(authorName) === query.author;
    const matchesLocation = !query.location || getStringArray(article.locations).some(
      location => normalizeFilterValue(location) === normalizeFilterValue(query.location as string)
    );
    const matchesTag = !query.tag || getArticleTopicTagsLegacy(article).some(
      tag => normalizeFilterValue(tag) === normalizeFilterValue(query.tag as string)
    );

    return matchesCategory && matchesAuthor && matchesLocation && matchesTag;
  });
};

const prepareOptimizedState = (articles: BenchmarkArticle[], authorsMap: Record<string, BenchmarkAuthor>): OptimizedPreparedState => {
  const prepared = articles.map((article) => {
    const authorName = authorsMap[article.author]?.name || article.author;
    const authorSlug = getAuthorSlug(authorName);
    const normalizedLocationSet = new Set(getStringArray(article.locations).map(location => normalizeFilterValue(location)));
    const topicTags = getStringArray(article.tags).filter(tag => !normalizedLocationSet.has(normalizeFilterValue(tag)));
    const normalizedTopicTagSet = new Set(topicTags.map(tag => normalizeFilterValue(tag)));

    return {
      article,
      authorSlug,
      normalizedLocationSet,
      topicTags,
      normalizedTopicTagSet
    };
  });

  const lookup = new Map<BenchmarkArticle, PreparedArticleFilterData>();
  const categoryCounts: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  prepared.forEach((item) => {
    lookup.set(item.article, item);

    categoryCounts[item.article.category] = (categoryCounts[item.article.category] || 0) + 1;
    authorCounts[item.article.author] = (authorCounts[item.article.author] || 0) + 1;

    getStringArray(item.article.locations).forEach((location) => {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    item.topicTags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return {
    prepared,
    lookup,
    counts: {
      categoryCounts,
      authorCounts,
      locationCounts,
      tagCounts
    }
  };
};

const buildOptimizedFilterOptions = (state: OptimizedPreparedState, authorsMap: Record<string, BenchmarkAuthor>) => {
  const categoryFilterOptions = Object.entries(CATEGORY_LABELS).map(([category, label]) => ({
    category,
    label,
    count: state.counts.categoryCounts[category] || 0
  }));

  const locationFilterOptions = Object.entries(state.counts.locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.location.localeCompare(b.location, 'it')));

  const authorFilterOptions = Object.entries(state.counts.authorCounts)
    .map(([authorKey, count]) => {
      const authorName = authorsMap[authorKey]?.name || authorKey;
      return {
        name: authorName,
        slug: getAuthorSlug(authorName),
        count
      };
    })
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name, 'it')));

  const tagFilterOptions = Object.entries(state.counts.tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.tag.localeCompare(b.tag, 'it')));

  return { categoryFilterOptions, locationFilterOptions, authorFilterOptions, tagFilterOptions };
};

const filterArticlesOptimized = (state: OptimizedPreparedState, query: FilterQuery) => {
  const normalizedSelectedLocation = query.location ? normalizeFilterValue(query.location) : null;
  const normalizedSelectedTag = query.tag ? normalizeFilterValue(query.tag) : null;

  const filtered: BenchmarkArticle[] = [];

  state.prepared.forEach((item) => {
    const matchesCategory = !query.category || item.article.category === query.category;
    const matchesAuthor = !query.author || item.authorSlug === query.author;
    const matchesLocation = !normalizedSelectedLocation || item.normalizedLocationSet.has(normalizedSelectedLocation);
    const matchesTag = !normalizedSelectedTag || item.normalizedTopicTagSet.has(normalizedSelectedTag);

    if (matchesCategory && matchesAuthor && matchesLocation && matchesTag) {
      filtered.push(item.article);
    }
  });

  return filtered;
};

const getArticleTopicTagsOptimized = (state: OptimizedPreparedState, article: BenchmarkArticle) =>
  state.lookup.get(article)?.topicTags || getArticleTopicTagsLegacy(article);

const checksumOptions = (options: ReturnType<typeof buildLegacyFilterOptions>) => {
  let hash = 0;

  options.categoryFilterOptions.forEach((item, index) => {
    hash = hashMix(hash, index + item.count);
  });
  options.locationFilterOptions.forEach((item, index) => {
    hash = hashMix(hash, index + item.count + item.location.length);
  });
  options.authorFilterOptions.forEach((item, index) => {
    hash = hashMix(hash, index + item.count + item.slug.length);
  });
  options.tagFilterOptions.forEach((item, index) => {
    hash = hashMix(hash, index + item.count + item.tag.length);
  });

  return hash >>> 0;
};

const checksumQueryLoopLegacy = (
  articles: BenchmarkArticle[],
  authorsMap: Record<string, BenchmarkAuthor>,
  queries: FilterQuery[]
) => {
  let hash = 0;

  queries.forEach((query) => {
    const filtered = filterArticlesLegacy(articles, authorsMap, query);
    hash = hashMix(hash, filtered.length);

    filtered.forEach((article) => {
      const tags = getArticleTopicTagsLegacy(article);
      hash = hashMix(hash, article.id);
      hash = hashMix(hash, tags.length);
    });
  });

  return hash >>> 0;
};

const checksumQueryLoopOptimized = (
  state: OptimizedPreparedState,
  queries: FilterQuery[]
) => {
  let hash = 0;

  queries.forEach((query) => {
    const filtered = filterArticlesOptimized(state, query);
    hash = hashMix(hash, filtered.length);

    filtered.forEach((article) => {
      const tags = getArticleTopicTagsOptimized(state, article);
      hash = hashMix(hash, article.id);
      hash = hashMix(hash, tags.length);
    });
  });

  return hash >>> 0;
};

const timeMs = <T>(fn: () => T) => {
  const start = performance.now();
  const result = fn();
  const ms = performance.now() - start;
  return { result, ms };
};

const optionsFingerprint = (options: ReturnType<typeof buildLegacyFilterOptions>) => ({
  category: options.categoryFilterOptions.map(item => `${item.category}:${item.count}`).join('|'),
  author: options.authorFilterOptions.map(item => `${item.slug}:${item.count}`).join('|'),
  location: options.locationFilterOptions.map(item => `${item.location}:${item.count}`).join('|'),
  tag: options.tagFilterOptions.map(item => `${item.tag}:${item.count}`).join('|')
});

const validateEquivalence = (
  articles: BenchmarkArticle[],
  authorsMap: Record<string, BenchmarkAuthor>,
  queries: FilterQuery[]
) => {
  const legacyOptions = buildLegacyFilterOptions(articles, authorsMap);
  const optimizedState = prepareOptimizedState(articles, authorsMap);
  const optimizedOptions = buildOptimizedFilterOptions(optimizedState, authorsMap);

  const a = optionsFingerprint(legacyOptions);
  const b = optionsFingerprint(optimizedOptions);

  if (a.category !== b.category || a.author !== b.author || a.location !== b.location || a.tag !== b.tag) {
    throw new Error('Filter option outputs differ between legacy and optimized implementations.');
  }

  const querySample = queries.slice(0, Math.min(25, queries.length));

  querySample.forEach((query, index) => {
    const legacyFiltered = filterArticlesLegacy(articles, authorsMap, query);
    const optimizedFiltered = filterArticlesOptimized(optimizedState, query);

    const legacyIds = legacyFiltered.map(item => item.id).join(',');
    const optimizedIds = optimizedFiltered.map(item => item.id).join(',');

    if (legacyIds !== optimizedIds) {
      throw new Error(`Filtered article mismatch on sample query ${index + 1}.`);
    }

    legacyFiltered.forEach((article, articleIndex) => {
      const legacyTags = getArticleTopicTagsLegacy(article).join('|');
      const optimizedTags = getArticleTopicTagsOptimized(optimizedState, article).join('|');
      if (legacyTags !== optimizedTags) {
        throw new Error(`Topic tag mismatch on sample query ${index + 1}, article index ${articleIndex + 1}.`);
      }
    });
  });
};

const average = (values: number[]) => values.reduce((acc, value) => acc + value, 0) / values.length;
const min = (values: number[]) => Math.min(...values);
const max = (values: number[]) => Math.max(...values);

const fmt = (value: number) => value.toFixed(2).padStart(8, ' ');

const main = async () => {
  const config = parseArgs();
  const { articles, authorsMap, queries } = await generateDataset(config);

  if (articles.length === 0) {
    throw new Error('No published articles found for benchmarking.');
  }

  const distinctLocations = new Set(articles.flatMap(article => getStringArray(article.locations))).size;
  const distinctTopicTags = new Set(articles.flatMap(article => getArticleTopicTagsLegacy(article))).size;
  const distinctAuthors = Object.keys(authorsMap).length;

  console.log('Benchmark config');
  console.log(`  mode=${config.mode}`);
  console.log(`  seed=${config.seed}`);
  console.log(`  articles=${articles.length}, authors=${distinctAuthors}, locations=${distinctLocations}, tags=${distinctTopicTags}`);
  if (config.mode === 'synthetic') {
    console.log(`  synthetic-shape: authors=${config.authors}, locations=${config.locations}, tags=${config.tags}`);
  }
  if (config.limit > 0) {
    console.log(`  limit=${config.limit}`);
  }
  console.log(`  queries=${config.queries}, rounds=${config.rounds}`);

  validateEquivalence(articles, authorsMap, queries);
  console.log('Validation');
  console.log('  legacy vs optimized outputs match (filter options + sample queries)');

  const legacyColdTimes: number[] = [];
  const legacyWarmTimes: number[] = [];
  const optimizedColdTimes: number[] = [];
  const optimizedWarmTimes: number[] = [];
  const optimizedPrepareTimes: number[] = [];
  const legacyChecksums: number[] = [];
  const optimizedChecksums: number[] = [];

  for (let round = 1; round <= config.rounds; round += 1) {
    const legacyCold = timeMs(() => {
      const options = buildLegacyFilterOptions(articles, authorsMap);
      const optionsHash = checksumOptions(options);
      const queryHash = checksumQueryLoopLegacy(articles, authorsMap, queries);
      return hashMix(optionsHash, queryHash);
    });

    const legacyWarm = timeMs(() => checksumQueryLoopLegacy(articles, authorsMap, queries));

    const optimizedCold = timeMs(() => {
      const preparedState = prepareOptimizedState(articles, authorsMap);
      const options = buildOptimizedFilterOptions(preparedState, authorsMap);
      const optionsHash = checksumOptions(options);
      const queryHash = checksumQueryLoopOptimized(preparedState, queries);
      return hashMix(optionsHash, queryHash);
    });

    const prepared = timeMs(() => prepareOptimizedState(articles, authorsMap));
    const optimizedWarm = timeMs(() => checksumQueryLoopOptimized(prepared.result, queries));

    legacyColdTimes.push(legacyCold.ms);
    legacyWarmTimes.push(legacyWarm.ms);
    optimizedColdTimes.push(optimizedCold.ms);
    optimizedPrepareTimes.push(prepared.ms);
    optimizedWarmTimes.push(optimizedWarm.ms);
    legacyChecksums.push(legacyCold.result);
    optimizedChecksums.push(optimizedCold.result);

    console.log(`Round ${round}`);
    console.log(`  legacy cold : ${fmt(legacyCold.ms)} ms`);
    console.log(`  legacy warm : ${fmt(legacyWarm.ms)} ms`);
    console.log(`  opt cold    : ${fmt(optimizedCold.ms)} ms`);
    console.log(`  opt prepare : ${fmt(prepared.ms)} ms`);
    console.log(`  opt warm    : ${fmt(optimizedWarm.ms)} ms`);
  }

  const referenceChecksum = legacyChecksums[0];
  const checksumsMatch = legacyChecksums.every(v => v === referenceChecksum)
    && optimizedChecksums.every(v => v === referenceChecksum);

  console.log('Summary (ms)');
  console.log(`  legacy cold avg/min/max : ${fmt(average(legacyColdTimes))} / ${fmt(min(legacyColdTimes))} / ${fmt(max(legacyColdTimes))}`);
  console.log(`  legacy warm avg/min/max : ${fmt(average(legacyWarmTimes))} / ${fmt(min(legacyWarmTimes))} / ${fmt(max(legacyWarmTimes))}`);
  console.log(`  opt cold avg/min/max    : ${fmt(average(optimizedColdTimes))} / ${fmt(min(optimizedColdTimes))} / ${fmt(max(optimizedColdTimes))}`);
  console.log(`  opt prepare avg/min/max : ${fmt(average(optimizedPrepareTimes))} / ${fmt(min(optimizedPrepareTimes))} / ${fmt(max(optimizedPrepareTimes))}`);
  console.log(`  opt warm avg/min/max    : ${fmt(average(optimizedWarmTimes))} / ${fmt(min(optimizedWarmTimes))} / ${fmt(max(optimizedWarmTimes))}`);

  const coldSpeedup = average(legacyColdTimes) / average(optimizedColdTimes);
  const warmSpeedup = average(legacyWarmTimes) / average(optimizedWarmTimes);

  console.log('Speedup');
  console.log(`  cold total (options + filtering + render tags): ${coldSpeedup.toFixed(2)}x`);
  console.log(`  warm query loop (filtering + render tags only): ${warmSpeedup.toFixed(2)}x`);
  console.log('Checksums');
  console.log(`  ${checksumsMatch ? 'match' : 'mismatch'} (legacy and optimized benchmark outputs)`);
};

await main();
