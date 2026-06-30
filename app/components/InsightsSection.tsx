import {
  getBlogPosts,
  getBlogCategories,
  mediaUrl,
  postSlug,
  readingMinutes,
} from '@/app/lib/strapi'
import InsightsGrid, { type InsightCard } from './InsightsGrid'

export default async function InsightsSection() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
  ])

  // Nothing published yet → don't render an empty section on the landing page.
  if (!posts.length) return null

  const cards: InsightCard[] = posts.map((post) => ({
    title: post.title,
    slug: postSlug(post),
    image: mediaUrl(post.featureImage, 'medium') ?? mediaUrl(post.featureImage),
    imageAlt: post.featureImage?.alternativeText || post.title,
    categories: (post.categories ?? []).map((c) => c.categoriesName),
    readTime: readingMinutes(post),
  }))

  const categoryNames = categories.map((c) => c.categoriesName)

  return (
    <section
      id="insights"
      className="relative w-full bg-[#3A3A3A] z-20 px-6 pt-20 pb-24 lg:px-36 lg:pt-28"
      aria-label="Industry Insights"
    >
      <h2 className="text-center uppercase text-white mb-10 text-[14px] sm:text-[30px]">
        See the Industry Latest Insights
      </h2>

      <InsightsGrid posts={cards} categories={categoryNames} />
    </section>
  )
}
