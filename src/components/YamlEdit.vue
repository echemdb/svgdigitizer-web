<template>
  <!-- CodeMirror Editor Container -->
  <div ref="editorContainer" class="editor"></div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'

import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, gutter, keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'

import { lintGutter } from '@codemirror/lint'
import { yaml } from '@codemirror/lang-yaml'
import { yamlSchema } from 'codemirror-json-schema/yaml'
import type { JSONSchema7 } from 'json-schema'

import { load as yamlLoad, dump as yamlDump } from 'js-yaml'
import { usePublishStore } from '@/stores/publish'

import $RefParser from '@apidevtools/json-schema-ref-parser'
import { Buffer } from 'buffer'

window.Buffer = Buffer

export default {
  name: 'YamlEditor',
  setup() {
    const publishStore = usePublishStore()
    const editorContainer = ref<HTMLDivElement>()
    const errors = ref([])
    let editorView: EditorView

    const initializeEditor = (schema: JSONSchema7) => {
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
          keymap.of([indentWithTab]),
        ],
      })

      editorView = new EditorView({
        state,
        parent: editorContainer.value,
      })
      // console.log(editorContainer.value.offsetWidth)
      // editorView.setSize(editorContainer.value.offsetWidth + 'px', 'auto')
      populateTemplate()
    }

    const populateTemplate = async () => {
      const response = await fetch('/template.yaml')
      const yaml = await response.text()

      try {
        const doc = yamlLoad(yaml, 'utf8')
        const curatorStr = localStorage.getItem('curator')
        if (curatorStr) {
          const curator = JSON.parse(curatorStr)
          for (const key in curator) {
            doc.curation.process[0][key] = curator[key]
          }
        }

        doc.curation.process[0]['date'] = new Date().toISOString().substring(0, 10)

        editorView.dispatch({
          changes: { from: 0, to: editorView.state.doc.length, insert: yamlDump(doc, 'utf8') },
        })
      } catch (e) {
        console.log(e)
      }
    }

    onMounted(async () => {
      const schema = await $RefParser.dereference(
        'https://raw.githubusercontent.com/echemdb/metadata-schema/main/schemas/svgdigitizer.json',
        {
          dereference: { circular: false },
          // basepath: '/schemas',
        },
      )
      initializeEditor(schema as JSONSchema7)
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
