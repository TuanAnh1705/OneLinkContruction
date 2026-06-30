import type { Metadata } from 'next'
import type { SeoMeta } from './strapi'

/**
 * Merge a Strapi DefaultSEO (already normalized) over a base Metadata object.
 * Returns `base` unchanged when `seo` is null. Strapi values win when present;
 * the metaTitle is used verbatim (`title.absolute`) so layout templates aren't
 * appended.
 */
export function mergeSeoMetadata(base: Metadata, seo: SeoMeta | null): Metadata {
  if (!seo) return base

  const title = seo.metaTitle ?? (base.title as string | undefined)
  const description = seo.metaDescription ?? base.description ?? undefined
  const keywords = seo.keywords
    ? seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : base.keywords

  const ogImage = seo.metaImage?.url
    ? { url: seo.metaImage.url, alt: seo.metaImage.alternativeText ?? title ?? '' }
    : undefined

  return {
    ...base,
    ...(title !== undefined ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    openGraph: {
      ...(base.openGraph ?? {}),
      ...(title !== undefined ? { title } : {}),
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      ...(base.twitter ?? {}),
      ...(title !== undefined ? { title } : {}),
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage.url] } : {}),
    },
  }
}
