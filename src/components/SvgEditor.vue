<template>
  <div class="app-content">
    <div id="svgeditor" style="width: 100%; height: 98vh"></div>
  </div>
</template>

<script setup lang="ts">
import Editor from 'svgedit'
import { onMounted } from 'vue'
import 'svgedit/dist/editor/svgedit.css'

onMounted(async () => {
  const editor = new Editor(document.getElementById('svgeditor'))
  editor.setConfig({
    imgPath: '/node_modules/svgedit/dist/editor/images',
    allowInitialUserOverride: true,
    extensions: [],
    noDefaultExtensions: true,
    userExtensions: [{ pathName: '/ext-svgdigitizer/ext-svgdigitizer.js' }],
  })

  editor.init()
})
</script>
