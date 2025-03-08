<script setup lang="ts">
import { ref } from 'vue'
import SvgEditor from './components/SvgEditor.vue'
import PdfViewer from './components/PdfViewer.vue'
import YamlEditor from './components/YamlEdit.vue'
import BibEditor from './components/BibEdit.vue'
import PublishPr from './components/PublishPr.vue'
import { usePdfStore } from '@/stores/pdf'
import { usePublishStore } from '@/stores/publish'
const pdfStore = usePdfStore()
const publishStore = usePublishStore()

const leftWidth = ref(300)
let startX = 0
let startWidth = 0

const startResize = (event: MouseEvent) => {
  startX = event.clientX
  startWidth = leftWidth.value
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
}

const resize = (event: MouseEvent) => {
  leftWidth.value = Math.max(100, startWidth + (event.clientX - startX))
}

const stopResize = () => {
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<template>
  <div class="container">
    <div class="left-panel" :style="{ width: leftWidth + 'px' }">
      <SvgEditor />
    </div>
    <div class="resizer" @mousedown="startResize"></div>
    <div class="right-panel">
      <div>
        <h2>.yaml</h2>
        <YamlEditor />
      </div>
      <div>
        <h2>.bib</h2>
        <BibEditor />
      </div>
    </div>
  </div>
  <div v-if="pdfStore.overlayActive" class="overlay-custom">
    <PdfViewer />
  </div>
  <div v-if="publishStore.overlayActive" class="overlay-custom">
    <PublishPr />
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(255, 255, 255);
  z-index: 1000;
}
.overlay-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.931);
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  z-index: 10;
}
/* header {
  line-height: 1.5;
  max-height: 100vh;
} */

/* .logo {
  display: block;
  margin: 0 auto 2rem;
} */

/* nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
} */

/* nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
} */

.container {
  display: flex;
  width: 100%;
  height: 98vh;
}

.left-panel {
  flex-grow: 1;
  background: #f0f0f0;
  overflow: auto;
}

.right-panel {
  flex-grow: 1;
  background: #e0e0e0;
  overflow: auto;
}

.resizer {
  width: 6px;
  cursor: ew-resize;
  background: #888;
  transition: background 0.2s;
}

.resizer:hover {
  background: #555;
}
</style>
