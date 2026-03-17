/**
 * E2B Desktop Stream Helpers
 *
 * Manages desktop streaming lifecycle using @e2b/desktop SDK.
 * The stream provides an interactive noVNC desktop accessible via iframe.
 */

import { Sandbox as DesktopSandbox } from '@e2b/desktop'

/** Ensure X display and desktop session are ready before stream.start (fixes exit 127 when connecting to code-interpreter sandbox) */
async function ensureDisplayReady(desktop: InstanceType<typeof DesktopSandbox>): Promise<void> {
  const display = (desktop as { display?: string }).display ?? ':0'
  try {
    // Start Xvfb if not already running
    await desktop.commands.run(
      `Xvfb ${display} -ac -screen 0 1024x768x24 -retro -nolisten tcp -nolisten unix`,
      { background: true, timeoutMs: 0 },
    )
    await new Promise((r) => setTimeout(r, 2000))
    const check = await desktop.commands.run(`xdpyinfo -display ${display}`)
    if (check.exitCode !== 0) {
      throw new Error('Xvfb failed to start')
    }
    await desktop.commands.run('startxfce4', { background: true, timeoutMs: 0 })
    await new Promise((r) => setTimeout(r, 3000))
  } catch (e) {
    throw new Error(
      `Desktop display setup failed: ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}

export async function startDesktopStream(
  apiKey: string,
  sandboxId: string,
): Promise<{ streamUrl: string; authKey: string }> {
  const desktop = await DesktopSandbox.connect(sandboxId, { apiKey })
  await ensureDisplayReady(desktop)
  await desktop.stream.start({ requireAuth: true })
  const authKey = desktop.stream.getAuthKey()
  const streamUrl = desktop.stream.getUrl({ authKey })
  return { streamUrl, authKey }
}

export async function stopDesktopStream(
  apiKey: string,
  sandboxId: string,
): Promise<void> {
  const desktop = await DesktopSandbox.connect(sandboxId, { apiKey })
  await desktop.stream.stop()
}
