import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const colorLightGrey = '#f4f4f4',
      colorDarkGrey = '#e0e0e0',
      colorBlack = '#161616',
      colorRed = '#da1e28',
      colorDarkBlue = '#0f62fe';

export const basicTheme = EditorView.theme(
  {
    '&': {
      color: colorBlack,
      backgroundColor: colorLightGrey
    },
    '.cm-content': {
      caretColor: colorBlack
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: colorBlack },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: colorDarkGrey },
    '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
    '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },
    '.cm-activeLine': { backgroundColor: colorDarkGrey + '50' },
    '.cm-selectionMatch': { backgroundColor: colorDarkGrey },
    '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
      outline: `1px solid ${colorDarkGrey}`
    },
    '&.cm-focused .cm-matchingBracket': {
      backgroundColor: colorDarkGrey,
      color: colorBlack
    },
    '.cm-gutters': {
      borderRight: colorDarkGrey,
      color: colorBlack,
      backgroundColor: colorDarkGrey
    },
    '.cm-activeLineGutter': {
      backgroundColor: colorDarkGrey
    },
    '.cm-tooltip': {
      border: 'none',
      backgroundColor: colorLightGrey
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent'
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: colorLightGrey,
      borderBottomColor: colorLightGrey
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: colorDarkGrey,
        color: colorBlack
      }
    }
  },
  { dark: false }
);

export const basicHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: colorBlack },
  {
    tag: [ t.name, t.deleted, t.character, t.propertyName, t.macroName ],
    color: colorBlack
  },
  { tag: [ t.variableName ], color: colorDarkBlue },
  { tag: [ t.function(t.variableName) ], color: colorBlack },
  { tag: [ t.labelName ], color: colorBlack },
  {
    tag: [ t.color, t.constant(t.name), t.standard(t.name) ],
    color: colorBlack
  },
  { tag: [ t.definition(t.name), t.separator ], color: colorBlack },
  { tag: [ t.brace ], color: colorBlack },
  {
    tag: [ t.annotation ],
    color: colorRed
  },
  {
    tag: [ t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace ],
    color: colorDarkBlue
  },
  {
    tag: [ t.typeName, t.className ],
    color: colorBlack
  },
  {
    tag: [ t.operator, t.operatorKeyword ],
    color: colorBlack
  },
  {
    tag: [ t.tagName ],
    color: colorDarkBlue
  },
  {
    tag: [ t.squareBracket ],
    color: colorBlack
  },
  {
    tag: [ t.angleBracket ],
    color: colorBlack
  },
  {
    tag: [ t.attributeName ],
    color: colorBlack
  },
  {
    tag: [ t.regexp ],
    color: colorBlack
  },
  {
    tag: [ t.quote ],
    color: colorBlack
  },
  { tag: [ t.string ], color: colorDarkBlue },
  {
    tag: t.link,
    color: colorBlack,
    textDecoration: 'underline',
    textUnderlinePosition: 'under'
  },
  {
    tag: [ t.url, t.escape, t.special(t.string) ],
    color: colorBlack
  },
  { tag: [ t.meta ], color: colorBlack },
  { tag: [ t.comment ], color: colorBlack, fontStyle: 'italic' },
  { tag: t.monospace, color: colorBlack },
  { tag: t.strong, fontWeight: 'bold', color: colorBlack },
  { tag: t.emphasis, fontStyle: 'italic', color: colorBlack },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.heading, fontWeight: 'bold', color: colorBlack },
  { tag: t.special(t.heading1), fontWeight: 'bold', color: colorBlack },
  { tag: t.heading1, fontWeight: 'bold', color: colorBlack },
  {
    tag: [ t.heading2, t.heading3, t.heading4 ],
    fontWeight: 'bold',
    color: colorBlack
  },
  {
    tag: [ t.heading5, t.heading6 ],
    color: colorBlack
  },
  { tag: [ t.atom, t.bool, t.special(t.variableName) ], color: colorBlack },
  {
    tag: [ t.processingInstruction, t.inserted ],
    color: colorBlack
  },
  {
    tag: [ t.contentSeparator ],
    color: colorBlack
  },
  { tag: t.invalid, color: colorBlack, borderBottom: `1px dotted ${colorRed}` }
]);

export default [
  basicTheme,
  syntaxHighlighting(basicHighlightStyle)
];