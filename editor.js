import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

export default function setupEditor() {
  const jsonRequestBody = document.querySelector("[data-json-request-body]");
  const jsonResponseBody = document.querySelector("[data-json-response-body]");
  const jsonResponseFull = document.querySelector("[data-json-response-full]");

  const basicExtensions = [
    basicSetup,
    keymap.of([defaultTabBinding]),
    json(),
    EditorState.tabSize.of(2),
  ];

  const requestEditor = new EditorView({
    state: EditorState.create({
      doc: "{\n\t\n}",
      extensions: basicExtensions,
    }),
    parent: jsonRequestBody,
  });

  const responseBodyEditor = new EditorView({
    state: EditorState.create({
      doc: "{}",
      extensions: [...basicExtensions, EditorView.editable.of(false)],
    }),
    parent: jsonResponseBody,
  });

  const responseFullEditor = new EditorView({
    state: EditorState.create({
      doc: "{}",
      extensions: [...basicExtensions, EditorView.editable.of(false)],
    }),
    parent: jsonResponseFull,
  });

  function updateResponseBodyEditor(value) {
    responseBodyEditor.dispatch({
      changes: {
        from: 0,
        to: responseBodyEditor.state.doc.length,
        insert: JSON.stringify(value, null, 2),
      },
    });
  }

  function updateResponseFullEditor(value) {
    responseFullEditor.dispatch({
      changes: {
        from: 0,
        to: responseFullEditor.state.doc.length,
        insert: JSON.stringify(value, null, 2),
      },
    });
  }

  return { requestEditor, updateResponseBodyEditor, updateResponseFullEditor };
}
