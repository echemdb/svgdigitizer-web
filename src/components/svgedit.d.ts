declare module 'svgedit' {
  class Editor {
    constructor(container: HTMLElement)
    init(): void
    setConfig(config: any): void
    addExtension(name: string, initfn: function, config)
    config: object
  }
  export default Editor
}
