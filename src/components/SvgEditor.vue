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
  const container = document.getElementById('svgeditor')
  if (container) {
    const editor = new Editor(container)
    editor.setConfig({
      imgPath: 'assets/svgedit/images',
      allowInitialUserOverride: true,
      extensions: [],
      noDefaultExtensions: true,
      userExtensions: [
        {
          pathName:
            '/svgdigitizer-web/assets/svgedit/extensions/ext-svgdigitizer/ext-svgdigitizer.js',
        },
      ],
    })

    editor.init()
  }
})
</script>
