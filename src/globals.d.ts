declare global {
  interface GlobalThis {
    Buffer: Buffer
  }
  interface Window {
    Buffer: Buffer
    svgEditor: {
      svgCanvas: {
        extensions: {
          [key: string]: {
            loadPage: () => void
          }
        }
      }
    }
  }
}

export {}
