<template>
  <div class="app-content">
    <div ref="svgEditorRef" style="width: 100%; height: 98vh"></div>
  </div>
</template>

<script setup lang="ts">
import Editor from 'svgedit'
import { onMounted, ref } from 'vue'
import 'svgedit/dist/editor/svgedit.css'
import { default as ExtSvgdigitizer } from './ext-svgdigitizer/ext-svgdigitizer.js'

const svgEditorRef = ref(null)
let editor: Editor | null = null

onMounted(async () => {
  if (svgEditorRef.value) {
    editor = new Editor(svgEditorRef.value)
    editor.setConfig({
      imgPath: 'assets/svgedit/images',
      allowInitialUserOverride: true,
      extensions: [],
      noDefaultExtensions: true,
      userExtensions: [
        // {
        //   pathName:
        //     '/svgdigitizer-web/assets/svgedit/extensions/ext-svgdigitizer/ext-svgdigitizer.js',
        // },
      ],
    })

    await editor.init()
    await editor.addExtension(
      ExtSvgdigitizer.name,
      ExtSvgdigitizer.init && ExtSvgdigitizer.init.bind(editor, editor.config),
      {},
    )
  }
})
</script>
