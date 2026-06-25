import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns)
    const outputStaticPath = joinSegments(argv.output, "static")
    await fs.promises.mkdir(outputStaticPath, { recursive: true })
    for (const fp of fps) {
      const src = joinSegments(staticPath, fp) as FilePath
      const dest = joinSegments(outputStaticPath, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }

    // Copy files from quartz/static-root/ to output root
    const rootStaticPath = joinSegments(QUARTZ, "static-root")
    try {
      await fs.promises.access(rootStaticPath)
      const rootFps = await fs.promises.readdir(rootStaticPath)
      for (const fp of rootFps) {
        const src = joinSegments(rootStaticPath, fp) as FilePath
        const stat = await fs.promises.stat(src)
        if (stat.isFile()) {
          const dest = joinSegments(argv.output, fp) as FilePath
          await fs.promises.copyFile(src, dest)
          yield dest
        }
      }
    } catch {
      // static-root directory doesn't exist, skip
    }
  },
  async *partialEmit() {},
})
