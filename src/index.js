import Modeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from 'bpmn-js-properties-panel';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';

import { EditorView } from '@codemirror/view';

import OpenAI from 'openai';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';

import './styles.scss';

import diagram from './diagram.bpmn';

const container = document.getElementById('container');

const openAIApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openAIApiKey,
  dangerouslyAllowBrowser: true
});

async function fetchFn(state) {
  return 'foobar';

  const { text } = state.doc;

  const partialFEELExpression = text[ 0 ];

  const context = '{}'; // TODO: add context

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        'role': 'system',
        'content': systemPrompt
      },
      {
        'role': 'user',
        'content': `Context:

${context}

Partial FEEL expression:

${partialFEELExpression}
`
      }
    ],
    model: 'gpt-4o'
  });

  console.log('[OPENAI] response:', chatCompletion);

  const { choices = [] } = chatCompletion;

  if (!choices.length) {
    return null;
  }

  const { message } = choices[ 0 ];

  const { content } = message;

  console.log('raw content', content);

  const suggestion = content.slice(partialFEELExpression.length);

  console.log('[OPENAI] suggested completion:', suggestion, ', partial:', partialFEELExpression, 'full:', content);

  return suggestion;
}

const modeler = new Modeler({
  container,
  propertiesPanel: {
    parent: '#properties',
    feelPopupContainer: '.bio-properties-panel',
    feelEditorExtensions: [
      inlineSuggestion({
        fetchFn,
        delay: 1000
      }),
      EditorView.updateListener.of((view) => {
        if (view.docChanged) {

          // console.log(view.state.doc.toString());
        }
      })
    ]
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule
  ],
  keyboard: {
    bindTo: document,
  },
  moddleExtensions: {
    zeebe: zeebeModdlePackage,
  }
});

modeler
  .importXML(diagram)
  .then(({ warnings }) => {
    if (warnings.length) {
      console.log(warnings);
    }

    const canvas = modeler.get('canvas');

    canvas.zoom('fit-viewport');
  })
  .catch((err) => {
    console.log(err);
  });

// modeler.on('elements.changed', async () => {
//   const { xml } = await modeler.saveXML({ format: true });

//   console.log(xml);
// });