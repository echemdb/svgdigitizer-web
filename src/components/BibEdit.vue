<template>
  <div ref="editorContainer" class="editor"></div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'

import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { usePublishStore } from '@/stores/publish'

export default {
  name: 'BibEditor',
  setup() {
    const publishStore = usePublishStore()
    const editorContainer = ref(null)
    const errors = ref([])
    let editorView = null

    const initializeEditor = () => {
      const state = EditorState.create({
        doc: '',
        extensions: [
          EditorView.updateListener.of((v) => {
            if (v.docChanged) {
              publishStore.setBibContent(v.state.doc.toString())
            }
          }),
          basicSetup,
        ],
      })

      editorView = new EditorView({
        state,
        // parent: editorContainer.value,
      })
    }

    onMounted(() => {
      initializeEditor()
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
  height: 20vh;
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
