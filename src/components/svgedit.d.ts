declare module 'svgedit' {
  class Editor {
    constructor(container: HTMLElement)
    init(): void
    setConfig(config: any): void
  }
  export default Editor
}
