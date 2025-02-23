import { defineStore } from 'pinia'

export const usePublishStore = defineStore('publishStore', {
  state: () => ({
    svgContent: '',
    identifier: '',
    yamlContent: '',
    bibContent: '',
    overlayActive: false,
  }),
  actions: {
    setIdentifier(newIdentifier: string) {
      if (typeof newIdentifier === 'string') {
        this.identifier = newIdentifier
      } else {
        console.error('Data must be an instance of string')
      }
    },
    setSvgContent(newSvgContent: string) {
      if (typeof newSvgContent === 'string') {
        this.svgContent = newSvgContent
      } else {
        console.error('Data must be an instance of string')
      }
    },

    setYamlContent(newYamlContent: string) {
      if (typeof newYamlContent === 'string') {
        this.yamlContent = newYamlContent
      } else {
        console.error('Data must be an instance of string')
      }
    },

    setBibContent(newBibContent: string) {
      if (typeof newBibContent === 'string') {
        this.bibContent = newBibContent
      } else {
        console.error('Data must be an instance of string')
      }
    },

    toggleOverlay(state: boolean) {
      if (typeof state === 'boolean') {
        this.overlayActive = state
      } else {
        console.error('Data must be an instance of boolean')
      }
    },
  },
})
