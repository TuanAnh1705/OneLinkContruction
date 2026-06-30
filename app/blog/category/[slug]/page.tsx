import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getBlogCategories,
  getCategoryBySlug,
  getPostsByCategorySlug,
  categorySlug,
  normalizeSeo,
  mediaUrl,
  postSlug,
} from '@/app/lib/strapi'
import { mergeSeoMetadata } from '@/app/lib/seo'
import Navbar from '@/app/components/Navbar'
import ContactButton from '@/app/components/ContactButton'
import BackToTopButton from '@/app/components/BackToTopButton'

// Prerender every category at build; new ones render on-demand and get cached.
export async function generateStaticParams() {
  try {
    return (await getBlogCategories()).map((c) => ({ slug: categorySlug(c) }))
  } catch {
    return []
  }
}

export async function generateMetadata(
  props: PageProps<'/blog/category/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Insights | OLCO' }

  const base: Metadata = {
    title: `${category.categoriesName} | OLCO Insights`,
    description: `Latest OLCO insights on ${category.categoriesName}.`,
  }
  // DefaultSEO from Strapi wins when present; null → base untouched.
  return mergeSeoMetadata(base, normalizeSeo(category.DefaultSEO))
}

export default async function CategoryPage(props: PageProps<'/blog/category/[slug]'>) {
  const { slug } = await props.params
  const [category, posts] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategorySlug(slug),
  ])
  if (!category) redirect('/')

  return (
    <main className="relative min-h-screen bg-[#2E2E2E] text-white">
      <Navbar />

      {/* Logo — scroll cùng nội dung như HeroSection */}
      <div className="absolute top-0 inset-x-0 z-40 pointer-events-none">
        <div className="max-w-480 mx-auto px-6 lg:px-36">
          <Link href="/" className="inline-block pointer-events-auto pt-4 lg:pt-1.5">
            <Image
              src="/Layer_1.svg"
              alt="OLCO"
              width={120}
              height={68}
              priority
              className="w-27.5 lg:w-40 h-auto lg:h-22.5"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-[1180px] px-6 pb-28 pt-28 lg:pt-36">
        <Link
          href="/#insights"
          className="text-[14px] text-white/55 transition-colors hover:text-white"
        >
          ← All Insights
        </Link>

        <h1
          className="mt-4 font-medium leading-[1.1] tracking-tight"
          style={{ fontSize: 'clamp(28px, 3.5vw, 48px)' }}
        >
          {category.categoriesName}
        </h1>

        {posts.length === 0 ? (
          <p className="mt-10 text-white/50">No insights in this category yet.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {posts.map((post) => {
              const img = mediaUrl(post.featureImage, 'medium') ?? mediaUrl(post.featureImage)
              return (
                <Link key={post.documentId} href={`/${postSlug(post)}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl aspect-3/4 w-full bg-white/5">
                    {img ? (
                      <Image
                        src={img}
                        alt={post.featureImage?.alternativeText || post.title}
                        fill
                        quality={85}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">
                        OLCO
                      </div>
                    )}
                  </div>
                  <h3
                    className="mt-4 font-medium text-white leading-snug"
                    style={{ fontSize: 'clamp(17px, 1.4vw, 21px)' }}
                  >
                    {post.title}
                  </h3>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-20 flex justify-start">
          <ContactButton label="Contact Us" href="/#contact" align="left" />
        </div>
      </section>

      <BackToTopButton />
    </main>
  )
}
