import {
  EditorSelection,
  Prec,
  StateEffect,
  StateField
} from '@codemirror/state';

import {
  Decoration,
  keymap,
  ViewPlugin,
  WidgetType
} from '@codemirror/view';

// defines the effect that will be dispatched by the view plugin
const InlineSuggestionEffect = StateEffect.define();

// defines the state field that will hold the suggestion
const InlineSuggestionState = StateField.define({
  create() {
    return { suggestion: null };
  },
  update(value, transaction) {
    console.log('InlineSuggestionState#update', logTime());

    const inlineSuggestionEffect = transaction.effects.find(effect =>
      effect.is(InlineSuggestionEffect)
    );

    if (inlineSuggestionEffect
      && transaction.state.doc
      && transaction.state.doc === inlineSuggestionEffect.value.doc) {
      console.log('setting suggestion to', inlineSuggestionEffect.value.text);

      return { suggestion: inlineSuggestionEffect.value.text };
    }

    console.log('setting suggestion to null');

    if (!inlineSuggestionEffect) {
      console.log('no inlineSuggestionEffect');
    } else if (!transaction.state.doc) {
      console.log('no transaction.state.doc');
    } else if (transaction.state.doc !== inlineSuggestionEffect.value.doc) {
      console.log('transaction.state.doc !== inlineSuggestionEffect.value.doc');
    }

    return { suggestion: null };
  },
});

// defines the decoration that will be rendered by the view plugin
function inlineSuggestionDecoration(view, prefix) {
  const pos = view.state.selection.main.head;

  const widgets = [];

  const w = Decoration.widget({
    widget: new InlineSuggestionWidget(prefix),
    side: 1,
  });

  widgets.push(w.range(pos));

  return Decoration.set(widgets);
}

// defines the widget that will be rendered by the view plugin
class InlineSuggestionWidget extends WidgetType {
  suggestion;

  constructor(suggestion) {
    super();
    this.suggestion = suggestion;
  }

  toDOM() {
    const div = document.createElement('span');

    div.style.opacity = '0.4';
    div.className = 'cm-inline-suggestion';
    div.textContent = this.suggestion;

    return div;
  }
}

// View plugin #1 - fetches the suggestion
export const fetchSuggestion = (fetchFn) =>
  ViewPlugin.fromClass(
    class Plugin {
      async update(update) {
        console.log('fetchSuggestion ViewPlugin#update', logTime());

        const doc = update.state.doc;

        if (!update.docChanged) {

          // prevents infinite loop
          return;
        }

        const result = await fetchFn(update.state);

        console.log('has suggestion, dispatching update');

        update.view.dispatch({
          effects: InlineSuggestionEffect.of({ text: result, doc: doc }),
        });
      }
    }
  );

// View plugin #2 - renders the suggestion
const renderInlineSuggestionPlugin = ViewPlugin.fromClass(
  class Plugin {
    decorations;

    constructor() {
      this.decorations = Decoration.none;
    }

    update(update) {
      console.log('renderInlineSuggestionPlugin ViewPlugin#update', logTime());

      const suggestion = update.state.field(
        InlineSuggestionState
      )?.suggestion;

      if (!suggestion) {
        this.decorations = Decoration.none;

        console.log('no suggestion, returning empty decorations');

        return;
      }

      this.decorations = inlineSuggestionDecoration(
        update.view,
        suggestion
      );
    }
  },
  {
    decorations: (v) => {
      console.log('returning decorations', v.decorations);

      return v.decorations;
    },
  }
);

const inlineSuggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: 'Tab',
      run: (view) => {
        const suggestionText = view.state.field(
          InlineSuggestionState
        )?.suggestion;

        // If there is no suggestion, do nothing and let the default keymap handle it
        if (!suggestionText) {
          return false;
        }

        view.dispatch({
          ...insertCompletionText(
            view.state,
            suggestionText,
            view.state.selection.main.head,
            view.state.selection.main.head
          ),
        });
        return true;
      },
    },
  ])
);

function insertCompletionText(
    state,
    text,
    from,
    to
) {
  return {
    ...state.changeByRange((range) => {
      if (range == state.selection.main)
        return {
          changes: { from: from, to: to, insert: text },
          range: EditorSelection.cursor(from + text.length),
        };
      const len = to - from;
      if (
        !range.empty ||
        (len &&
          state.sliceDoc(range.from - len, range.from) !=
            state.sliceDoc(from, to))
      )
        return { range };
      return {
        changes: { from: range.from - len, to: range.from, insert: text },
        range: EditorSelection.cursor(range.from - len + text.length),
      };
    }),
    userEvent: 'input.complete',
  };
}

export function inlineSuggestion(options) {
  const { delay = 300 } = options;

  const getSuggestion = debouncePromise(options.getSuggestion, delay);

  return [
    InlineSuggestionState,
    fetchSuggestion(getSuggestion),
    renderInlineSuggestionPlugin,
    inlineSuggestionKeymap
  ];
}

function debouncePromise(fn, wait, abortValue = undefined) {
  let cancel = () => {};

  const wrapFunc = (...args) => {
    cancel();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(fn(...args)), wait);

      cancel = () => {
        clearTimeout(timer);

        if (abortValue !== undefined) {
          reject(abortValue);
        }
      };
    });
  };

  return wrapFunc;
}

function logTime() {
  const now = new Date();

  return `${padStart(now.getHours())}:${padStart(now.getMinutes())}:${padStart(now.getSeconds())}`;
}

function padStart(number) {
  return number.toString().padStart(2, '0');
}