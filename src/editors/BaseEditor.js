import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
  rectangularSelection, crosshairCursor,
  lineNumbers, highlightActiveLineGutter, EditorView } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
  foldGutter, foldKeymap } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap, lintGutter } from '@codemirror/lint';
import theme from './Theme';

/**
 * @typedef { import('@codemirror/state').Extension } Extension
 */

/**
 * @type {Extension}
 */
export const basicEditor = (() => [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  theme,
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    // ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    indentWithTab
  ])
])();


/**
 * @type { Extension }
 */
export const advancedEditor = (() => [
  lineNumbers(),
  foldGutter(),
  lintGutter()
])();

/**
 * @type { Extension }
 */
export const basicViewer = (() => [
  EditorView.editable.of(false),
  drawSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches()
])();

/**
 * @param { Record<string, (position: number, event: MouseEvent) => void> } callbacks
 *
 * @return { Extension }
 */
export function onMouseHandlers(callbacks) {

  const trigger = (fn) => {
    return (event, view) => {

      const position = view.posAtCoords({
        x: event.x,
        y: event.y
      });

      fn(position);
    };
  };

  /**
   * @type { import("@codemirror/view").DOMEventHandlers }
   */
  const mappedCallbacks = {};

  for (const key in callbacks) {

    const cb = callbacks[key];

    if (!cb) {
      continue;
    }

    mappedCallbacks[key] = trigger(callbacks[key]);
  }

  return EditorView.domEventHandlers(mappedCallbacks);
}

/**
 * @param { (string) => void } onChange
 *
 * @return { Extension }
 */
export function onChangeHandler(onChange) {
  return EditorView.updateListener.of((update) => {
    if (update.docChanged && isViewUpdateFromUserInput(update)) {
      onChange(update.state.doc.toString());
    }
  });
}

function isViewUpdateFromUserInput(viewUpdate) {
  if (viewUpdate.docChanged) {
    for (const transaction of viewUpdate.transactions) {
      const userEventType = transaction.annotation(Transaction.userEvent);
      if (userEventType) return userEventType;
    }
  }

  return false;
}

/**
 * @param { (string) => void } onChange
 *
 * @return { Extension }
 */
export function onSelectionChangeHandler(onChange) {

  let selection = null;

  return EditorView.updateListener.of((update) => {

    const newSelection = update.state.selection;

    if (selection && newSelection.eq(selection)) {
      return;
    }

    selection = newSelection;

    onChange(selection);
  });
}

/**
 * @param { {
 *   extensions?: Extension[],
 *   parent: Element,
 *   doc?: string
 * } }
 *
 * @returns { EditorView }
 */
export function createEditor({
  extensions,
  parent,
  doc
}) {

  return new EditorView({
    state: EditorState.create({
      doc,
      extensions
    }),
    parent
  });
}