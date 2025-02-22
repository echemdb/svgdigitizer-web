<template>
  <div class="gallery">
    <div class="page-thumbnails">
      <canvas
        v-for="(canvasElement, index) in canvases"
        :key="index"
        ref="canvasRefs"
        class="thumbnail"
        @click="openOverlay(index)"
      />
    </div>
    <button class="close-btn" @click="closeGalleryOverlay">X</button>
    <div v-if="overlayVisible" class="page-overlay" @click="closeOverlay">
      <div class="page-overlay-content" @click.stop>
        <div
          ref="pageOverlayCanvasContainer"
          @dblclick="sendPageSvgedit"
          @mouseover="showHoverTooltip"
        ></div>
        <button class="close-btn" @click="closePageOverlay">X</button>
        <div v-if="tooltipVisible"><label>double click to use page</label></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
import { usePdfStore } from '@/stores/pdf'

const pdfStore = usePdfStore()
const canvases = ref([])
const canvasRefs = ref([])
const selectedPageNum = ref(null)
const overlayCanvas = ref(null)
const overlayVisible = ref(false)
const tooltipVisible = ref(false)
const pageOverlayCanvasContainer = ref(null)

const renderPages = async (pdfDoc) => {
  canvases.value = new Array(pdfDoc.numPages).fill(null)

  await nextTick()

  canvasRefs.value.forEach(async (canvas, index) => {
    if (canvas) {
      const page = await pdfDoc.getPage(index + 1)
      const ctx = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: 1 })
      canvas.width = viewport.width
      canvas.height = viewport.height

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      }

      await page.render(renderContext).promise
    }
  })
}
const openOverlay = async (index) => {
  selectedPageNum.value = index
  const originalCanvas = canvasRefs.value[index]
  if (originalCanvas) {
    overlayCanvas.value = originalCanvas.cloneNode()
    overlayCanvas.value.getContext('2d').drawImage(originalCanvas, 0, 0)
    overlayVisible.value = true
    await nextTick() // overlayVisible needs to take effect
    pageOverlayCanvasContainer.value.innerHTML = ''
    pageOverlayCanvasContainer.value.appendChild(overlayCanvas.value)
  }
}
const showHoverTooltip = () => {
  tooltipVisible.value = true
}

const closePageOverlay = () => {
  overlayVisible.value = false
}
const closeGalleryOverlay = () => {
  pdfStore.toggleOverlay(false)
}
const sendPageSvgedit = () => {
  pdfStore.setPageNum(selectedPageNum.value)
  pdfStore.toggleOverlay(false)
  svgEditor.svgCanvas.extensions['svgdigitizer'].loadPage()
}

onMounted(async () => {
  const loadingTask = pdfjsLib.getDocument({ data: pdfStore.pdfContent.slice() }) // buffer is consumed
  const pdfDoc = await loadingTask.promise

  renderPages(pdfDoc)
  const doiRegex = /10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+/g
  const textItems = await (await pdfDoc.getPage(1)).getTextContent()

  textItems.items.forEach((text) => {
    const matches = text.str.match(doiRegex)
    if (matches) {
      pdfStore.setDoi(matches[0])
    }
  })
})
</script>

<style>
.gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: black;
}

.page-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  padding: 10px;
  max-width: 90vw;
  justify-content: center;
  background-color: black;
}

.thumbnail {
  width: 100%;
  height: auto;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
}

.page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-overlay-content {
  position: relative;
  text-align: center;
  background: rgba(0, 0, 0, 1);
}

.page-overlay-content canvas {
  max-width: 90%;
  max-height: 80vh;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.close-btn:hover {
  background: darkred;
}
</style>
