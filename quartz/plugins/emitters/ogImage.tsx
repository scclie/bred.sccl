import { QuartzEmitterPlugin } from "../types"
import { i18n } from "../../i18n"
import { unescapeHTML } from "../../util/escape"
import { FullSlug, getFileExtension, isAbsoluteURL, joinSegments, QUARTZ } from "../../util/path"
import { ImageOptions, SocialImageOptions, defaultImage, getSatoriFonts } from "../../util/og"
import sharp from "sharp"
import satori, { SatoriOptions } from "satori"
import { loadEmoji, getIconCode } from "../../util/emoji"
import { Readable } from "stream"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { QuartzPluginData } from "../vfile"
import fs from "node:fs/promises"
import { styleText } from "util"

const defaultOptions: SocialImageOptions = {
  colorScheme: "lightMode",
  width: 1200,
  height: 630,
  imageStructure: defaultImage,
  excludeRoot: false,
}

/**
 * Generates social image (OG/twitter standard) and saves it as `.webp` inside the public folder
 */
async function generateSocialImage(
  { description, fonts, title, fileData, cfg }: ImageOptions,
  userOpts: SocialImageOptions,
): Promise<Readable> {
  const { width, height } = userOpts

  // Считываем твой кастомный фон og-image.png из quartz/static/
  const ogBgPath = joinSegments(QUARTZ, "static", "og-image.png")
  let ogBgBase64: string | undefined = undefined
  try {
    const bgData = await fs.readFile(ogBgPath)
    ogBgBase64 = `data:image/png;base64,${bgData.toString("base64")}`
  } catch (err) {
    console.warn(styleText("yellow", `Warning: Could not find custom background at ${ogBgPath}`))
  }

  // Достаем метаданные: дату, время чтения и теги
  const dateStr = fileData.dates?.created
    ? new Date(fileData.dates.created).toLocaleDateString(cfg.locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""
  const readingTime = fileData.description
    ? Math.ceil(fileData.description.trim().split(/\s+/).length / 150)
    : 1
  const readingTimeStr = `${readingTime} min read`
  const tags: string[] = (fileData.frontmatter?.tags as string[]) ?? []

  const titleSize = scaleTitleSize(title)
  const descriptionSize = scaleDescriptionSize(description)

  // СБОРКА КАРТОЧКИ С СИСТЕМНЫМИ ИКОНКАМИ И УВЕЛИЧЕННЫМ ТЕКСТОМ
  const imageComponent = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        position: "relative",
        backgroundImage: ogBgBase64 ? `url(${ogBgBase64})` : undefined,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#2E3440",
      },
      children: [
        // ВЕРХНЯЯ ЧАСТЬ: Вотермарка sccl.cc
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            },
            children: {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                },
                children: [
                  {
                    type: "span",
                    props: {
                      children: "> scclie://",
                      style: {
                        color: "#88C0D0",
                        fontSize: "36px",
                        fontWeight: "900",
                        fontFamily: "Martian Mono",
                      },
                    },
                  },
                  {
                    type: "span",
                    props: {
                      children: "notes",
                      style: {
                        color: "#88C0D0",
                        fontSize: "36px",
                        fontWeight: "900",
                        fontFamily: "Martian Mono",
                      },
                    },
                  },
                ],
              },
            },
          },
        },

        // СРЕДНЯЯ ЧАСТЬ: Заголовок и Описание
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              maxWidth: "70%",
              marginBottom: "auto",
              marginTop: "40px",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontSize: `${titleSize}px`,
                    fontWeight: "900",
                    color: "#E5E9F0",
                    fontFamily: "Martian Mono",
                    marginBottom: "16px",
                  },
                  children: title,
                },
              },
              {
                type: "span",
                props: {
                  style: {
                    fontSize: `${descriptionSize}px`,
                    color: "#D8DEE9",
                    fontFamily: "Cascadia Mono",
                    fontWeight: "900",
                    lineHeight: "1.4",
                  },
                  children: description,
                },
              },
            ],
          },
        },

        // НИЖНЯЯ ЧАСТЬ: Крупные системные метаданные и увеличенные теги
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(67, 76, 94, 0.5)",
              paddingTop: "24px", // Чуть больше отступ сверху
            },
            children: [
              // Левая сторона: Календарь и Часы в line-формате (сделаны больше)
              {
                type: "div",
                props: {
                  style: { display: "flex", gap: "32px", alignItems: "center" },
                  children: [
                    dateStr && {
                      type: "div",
                      props: {
                        style: { display: "flex", alignItems: "center", gap: "10px" },
                        children: [
                          // Системная SVG иконка календаря Quartz
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#D8DEE9"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{ opacity: 0.7 }}
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>,
                          {
                            type: "span",
                            props: {
                              style: {
                                color: "#D8DEE9",
                                fontSize: "22px",
                                fontFamily: "Inter",
                                opacity: 0.7,
                              }, // Размер увеличен до 22px
                              children: dateStr,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", alignItems: "center", gap: "10px" },
                        children: [
                          // Системная SVG иконка часов Quartz
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#D8DEE9"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{ opacity: 0.7 }}
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>,
                          {
                            type: "span",
                            props: {
                              style: {
                                color: "#D8DEE9",
                                fontSize: "22px",
                                fontFamily: "Inter",
                                opacity: 0.7,
                              }, // Размер увеличен до 22px
                              children: readingTimeStr,
                            },
                          },
                        ],
                      },
                    },
                  ].filter(Boolean),
                },
              },
              // Правая сторона: Крупные аккуратные плашки тегов
              {
                type: "div",
                props: {
                  style: { display: "flex", gap: "12px" },
                  children: tags.slice(0, 3).map((tag) => ({
                    type: "div",
                    props: {
                      style: {
                        padding: "6px 16px", // Увеличили внутренние отступы плашек
                        backgroundColor: "#3B4252",
                        border: "1px solid #434C5E",
                        borderRadius: "6px",
                        display: "flex",
                      },
                      children: {
                        type: "span",
                        props: {
                          style: {
                            color: "#81A1C1",
                            fontSize: "19px",
                            fontFamily: "Cascadia Mono",
                            fontWeight: "600",
                          }, // Размер увеличен до 19px
                          children: tag.startsWith("#") ? tag : `#${tag}`,
                        },
                      },
                    },
                  })),
                },
              },
            ],
          },
        },
      ],
    },
  }

  const svg = await satori(imageComponent as any, {
    width,
    height,
    fonts,
    loadAdditionalAsset: async (languageCode: string, segment: string) => {
      if (languageCode === "emoji") {
        return await loadEmoji(getIconCode(segment))
      }
      return languageCode
    },
  })

  return sharp(Buffer.from(svg)).webp({ quality: 40 })
}

async function processOgImage(
  ctx: BuildCtx,
  fileData: QuartzPluginData,
  fonts: SatoriOptions["fonts"],
  fullOptions: SocialImageOptions,
) {
  const cfg = ctx.cfg.configuration
  const slug = fileData.slug!
  const titleSuffix = cfg.pageTitleSuffix ?? ""
  const title =
    (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
  const description =
    fileData.frontmatter?.socialDescription ??
    fileData.frontmatter?.description ??
    unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

  const stream = await generateSocialImage(
    {
      title,
      description,
      fonts,
      cfg,
      fileData,
    },
    fullOptions,
  )

  return write({
    ctx,
    content: stream,
    slug: `${slug}-og-image` as FullSlug,
    ext: ".webp",
  })
}

export const CustomOgImagesEmitterName = "CustomOgImages"
export const CustomOgImages: QuartzEmitterPlugin<Partial<SocialImageOptions>> = (userOpts) => {
  const fullOptions = { ...defaultOptions, ...userOpts }

  return {
    name: CustomOgImagesEmitterName,
    getQuartzComponents() {
      return []
    },
    async *emit(ctx, content, _resources) {
      const cfg = ctx.cfg.configuration
      const headerFont = cfg.theme.typography.header
      const bodyFont = cfg.theme.typography.body
      const fonts = await getSatoriFonts(headerFont, bodyFont)

      for (const [_tree, vfile] of content) {
        if (vfile.data.frontmatter?.socialImage !== undefined) continue
        yield processOgImage(ctx, vfile.data, fonts, fullOptions)
      }
    },
    async *partialEmit(ctx, _content, _resources, changeEvents) {
      const cfg = ctx.cfg.configuration
      const headerFont = cfg.theme.typography.header
      const bodyFont = cfg.theme.typography.body
      const fonts = await getSatoriFonts(headerFont, bodyFont)

      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if (changeEvent.file.data.frontmatter?.socialImage !== undefined) continue
        if (changeEvent.type === "add" || changeEvent.type === "change") {
          yield processOgImage(ctx, changeEvent.file.data, fonts, fullOptions)
        }
      }
    },
    externalResources: (ctx) => {
      if (!ctx.cfg.configuration.baseUrl) {
        return {}
      }

      const baseUrl = ctx.cfg.configuration.baseUrl
      return {
        additionalHead: [
          (pageData) => {
            const isRealFile = pageData.filePath !== undefined
            let userDefinedOgImagePath = pageData.frontmatter?.socialImage

            if (userDefinedOgImagePath) {
              userDefinedOgImagePath = isAbsoluteURL(userDefinedOgImagePath)
                ? userDefinedOgImagePath
                : `https://${baseUrl}/static/${userDefinedOgImagePath}`
            }

            const generatedOgImagePath = isRealFile
              ? `https://${baseUrl}/${pageData.slug!}-og-image.webp`
              : undefined
            const defaultOgImagePath = `https://${baseUrl}/static/og-image.png`
            const ogImagePath = userDefinedOgImagePath ?? generatedOgImagePath ?? defaultOgImagePath
            const ogImageMimeType = `image/${getFileExtension(ogImagePath) ?? "png"}`
            return (
              <>
                {!userDefinedOgImagePath && (
                  <>
                    <meta property="og:image:width" content={fullOptions.width.toString()} />
                    <meta property="og:image:height" content={fullOptions.height.toString()} />
                  </>
                )}

                <meta property="og:image" content={ogImagePath} />
                <meta property="og:image:url" content={ogImagePath} />
                <meta name="twitter:image" content={ogImagePath} />
                <meta property="og:image:type" content={ogImageMimeType} />
              </>
            )
          },
        ],
      }
    },
  }
}

function scaleTitleSize(title: string) {
  const len = title.length

  if (len < 40) return 56
  if (len < 80) return 48
  if (len < 120) return 40
  if (len < 160) return 34
  return 22
}

function scaleDescriptionSize(description: string) {
  const len = description.length

  if (len < 80) return 38
  if (len < 140) return 34
  if (len < 220) return 30
  if (len < 320) return 24
  return 18
}
