import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

let requestEditor = null,
  updateResponseBodyEditor = null,
  updateResponseFullEditor = null,
  updateRequestBodyEditor = null;

export default function setupEditor() {
  if (
    (requestEditor === null || updateResponseBodyEditor === null,
    updateResponseFullEditor === null)
  ) {
    const jsonRequestBody = document.querySelector("[data-json-request-body]");
    const jsonResponseBody = document.querySelector(
      "[data-json-response-body]"
    );
    const jsonResponseFull = document.querySelector(
      "[data-json-response-full]"
    );

    const basicExtensions = [
      basicSetup,
      keymap.of([defaultTabBinding]),
      json(),
      EditorState.tabSize.of(2),
    ];

    requestEditor = new EditorView({
      state: EditorState.create({
        doc: "{}",
        extensions: basicExtensions,
      }),
      parent: jsonRequestBody,
    });

    updateRequestBodyEditor = (value) => {
      requestEditor.dispatch({
        changes: {
          from: 0,
          to: requestEditor.state.doc.length,
          insert: JSON.stringify(value, null, 2),
        },
      });
    };

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

    updateResponseBodyEditor = (value) => {
      responseBodyEditor.dispatch({
        changes: {
          from: 0,
          to: responseBodyEditor.state.doc.length,
          insert: JSON.stringify(value, null, 2),
        },
      });
    };

    updateResponseFullEditor = (value) => {
      responseFullEditor.dispatch({
        changes: {
          from: 0,
          to: responseFullEditor.state.doc.length,
          insert: JSON.stringify(value, null, 2),
        },
      });
    };
  }
  return {
    requestEditor,
    updateRequestBodyEditor,
    updateResponseBodyEditor,
    updateResponseFullEditor,
  };
}
