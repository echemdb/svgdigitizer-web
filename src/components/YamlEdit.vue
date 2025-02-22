<template>
  <!-- CodeMirror Editor Container -->
  <div ref="editorContainer" class="editor"></div>
</template>

<script>
import { ref, onMounted } from 'vue'

import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, gutter } from '@codemirror/view'

import { lintGutter } from '@codemirror/lint'
import { yaml } from '@codemirror/lang-yaml'
import { yamlSchema } from 'codemirror-json-schema/yaml'

import { usePublishStore } from '@/stores/publish'

// import $RefParser from '@apidevtools/json-schema-ref-parser'
// import { Buffer } from 'buffer'
// globalThis.Buffer = Buffer

export default {
  name: 'YamlEditor',
  setup() {
    const publishStore = usePublishStore()
    const editorContainer = ref(null)
    const errors = ref([])
    // const editorView = null

    const initializeEditor = (schema) => {
      const state = EditorState.create({
        doc: '',
        extensions: [
          EditorView.updateListener.of((v) => {
            if (v.docChanged) {
              publishStore.setYamlContent(v.state.doc.toString())
            }
          }),
          gutter({ class: 'CodeMirror-lint-markers' }),
          lintGutter(),
          basicSetup,
          yaml(),
          yamlSchema(schema),
        ],
      })

      new EditorView({
        state,
        parent: editorContainer.value,
      })
    }

    onMounted(async () => {
      const schema = await await (
        await fetch(
          'https://raw.githubusercontent.com/echemdb/metadata-schema/main/schemas/svgdigitizer.json',
        )
      ).json()
      // console.log(schema)
      // await $RefParser.dereference(schema)
      // console.log(schema)
      // const parser = new $RefParser()
      // parser.dereference(
      //   'https://raw.githubusercontent.com/echemdb/metadata-schema/main/schemas/svgdigitizer.json',
      // )
      // console.log(parser.schema)
      initializeEditor(schema)
    })

    return {
      editorContainer,
      errors,
    }
  },
}
</script>

<style scoped>
.editor {
  border: 1px solid #ccc;
  height: 65vh;
  width: 98%;
  margin-bottom: 20px;
}

.error-list {
  margin-top: 10px;
  color: red;
  font-family: Arial, sans-serif;
}

.error-item {
  font-size: 14px;
  margin-bottom: 5px;
}

.cm-lint-gutter {
  background-color: rgba(255, 0, 0, 0.2);
  width: 20px;
}

.cm-lint-error {
  background-color: red;
  height: 4px;
  width: 100%;
  margin: 2px;
}
</style>
