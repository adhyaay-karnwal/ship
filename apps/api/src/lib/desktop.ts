/**
 * E2B Desktop Stream Helpers
 *
 * Manages desktop streaming lifecycle using @e2b/desktop SDK.
 * The stream provides an interactive noVNC desktop accessible via iframe.
 *
 * Uses Sandbox.connect() to attach to existing sandboxes (created via @e2b/code-interpreter).
 * The e2bdev/desktop template runs Xvfb + Xfce at boot, so we call stream.start() directly
 * per E2B docs: https://github.com/e2b-dev/desktop
 */

import { Sandbox as DesktopSandbox } from '@e2b/desktop'

export async function startDesktopStream(
  apiKey: string,
  sandboxId: string,
): Promise<{ streamUrl: string; authKey: string }> {
  try {
    const desktop = await DesktopSandbox.connect(sandboxId, { apiKey })
    // Allow template start command (Xvfb + Xfce + x11vnc) to finish when sandbox was just resumed
    await new Promise((r) => setTimeout(r, 5000))
    await desktop.stream.start({ requireAuth: true })
    const authKey = desktop.stream.getAuthKey()
    const streamUrl = desktop.stream.getUrl({ authKey })
    return { streamUrl, authKey }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const stack = e instanceof Error ? e.stack : undefined
    console.error('[desktop] startDesktopStream failed', { sandboxId, error: msg, stack })
    throw new Error(`Desktop stream failed: ${msg}`)
  }
}

export async function stopDesktopStream(
  apiKey: string,
  sandboxId: string,
): Promise<void> {
  try {
    const desktop = await DesktopSandbox.connect(sandboxId, { apiKey })
    await desktop.stream.stop()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[desktop] stopDesktopStream failed', { sandboxId, error: msg })
    throw e
  }
}
