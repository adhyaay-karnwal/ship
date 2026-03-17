/**
 * E2B Desktop Stream Helpers
 *
 * Manages desktop streaming lifecycle using @e2b/desktop SDK.
 * The stream provides an interactive noVNC desktop accessible via iframe.
 */

import { Sandbox as DesktopSandbox } from '@e2b/desktop'

/**
 * Ensure X display and desktop session are ready before stream.start.
 * Probe-first: if xdpyinfo succeeds, the template already started the desktop — skip setup.
 * Otherwise run Xvfb + startxfce4 (for sandboxes where desktop wasn't pre-started).
 */
async function ensureDisplayReady(desktop: InstanceType<typeof DesktopSandbox>): Promise<void> {
  const display = (desktop as { display?: string }).display ?? ':0'

  const runWithErrorContext = async (
    cmd: string,
    opts?: { background?: boolean; timeoutMs?: number },
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> => {
    try {
      const result = await desktop.commands.run(cmd, opts ?? {})
      return {
        exitCode: result.exitCode ?? -1,
        stdout: (result as { stdout?: string }).stdout ?? '',
        stderr: (result as { stderr?: string }).stderr ?? '',
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      throw new Error(`Desktop display setup failed: ${msg}`)
    }
  }

  // Probe first: template (e2bdev/desktop) may already have Xvfb + Xfce running at boot
  const probe = await runWithErrorContext(`xdpyinfo -display ${display}`)
  if (probe.exitCode === 0) {
    return // Display already ready
  }

  // Display not ready — start Xvfb and Xfce manually (e.g. sandbox was paused, desktop died)
  try {
    await runWithErrorContext(
      `Xvfb ${display} -ac -screen 0 1024x768x24 -retro -nolisten tcp -nolisten unix`,
      { background: true, timeoutMs: 0 },
    )
    await new Promise((r) => setTimeout(r, 2000))

    const check = await runWithErrorContext(`xdpyinfo -display ${display}`)
    if (check.exitCode !== 0) {
      throw new Error(
        `Xvfb failed to start. stderr: ${check.stderr || '(none)'} stdout: ${check.stdout || '(none)'}`,
      )
    }

    await runWithErrorContext('startxfce4', { background: true, timeoutMs: 0 })
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
