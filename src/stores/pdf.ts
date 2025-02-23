import { defineStore } from 'pinia'

export const usePdfStore = defineStore('pdfStore', {
  state: () => ({
    pdfContent: new Uint8Array([]),
    pageNum: 0,
    doi: '',
    overlayActive: false,
  }),
  actions: {
    setPdfContent(newPdfContent: Uint8Array) {
      if (newPdfContent instanceof Uint8Array) {
        this.pdfContent = newPdfContent
      } else {
        console.error('Data must be an instance of Uint8Array')
      }
    },
    setDoi(newDoi: string) {
      if (typeof newDoi === 'string') {
        this.doi = newDoi
      } else {
        console.error('Data must be an instance of string')
      }
    },
    setPageNum(newPageNum: number) {
      if (Number.isInteger(newPageNum)) {
        this.pageNum = newPageNum
      } else {
        console.error('Value must be an integer')
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
