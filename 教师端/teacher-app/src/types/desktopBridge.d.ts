export interface BubuDesktopBridge {
  platform: string
  getWorkspaceValue<T = unknown>(key: string): Promise<T | undefined>
  setWorkspaceValue(key: string, value: unknown): Promise<boolean>
  openCoursewareFile(): Promise<{ filePath: string; fileName: string } | null>
  saveClassSnapshot(defaultName?: string): Promise<{ filePath: string } | null>
  exportCoursewareFile(defaultName?: string): Promise<{ filePath: string } | null>
  printCurrentWindow(): Promise<boolean>
  getOfficeIntegrationStatus(): Promise<{
    status: 'pending_vendor_decision'
    boundary: string
    supportedNow: string[]
  }>
}

declare global {
  interface Window {
    bubuDesktop?: BubuDesktopBridge
  }
}

export {}
