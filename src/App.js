import React, { Fragment, useEffect, useRef, useState } from 'react';

import { Button, ButtonSet, Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, InlineLoading, TextArea, TextInput, Tile, ToastNotification } from '@carbon/react';

import { Copy, Paste, Search, Settings, ThumbsUp, ThumbsDown } from '@carbon/icons-react';

import { isNil, set } from 'min-dash';

import FeelEditor from './editors/FeelEditor';
import JsonEditor from './editors/JsonEditor';

import {
  evaluate as evaluateFeel,
  parse as parseFeel,
  SyntaxError
} from './FeelEngine';

import fetchOpenAICompletion from './OpenAI';

const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const DEFAULT_MODEL = 'ft:gpt-3.5-turbo-0125:camunda-services-gmbh:feel-240612:9ZGyNJzX';

const INITIAL_CONTEXT_STRING = JSON.stringify({ foo: 1 }, null, 2);
const INITIAL_EXPRESSION = 'foo + 1';

const RATINGS = {
  GOOD: 'good',
  BAD: 'bad'
};

export default function App() {
  const [ apiKey, setApiKey ] = useState(DEFAULT_OPENAI_API_KEY);
  const [ model, setModel ] = useState(DEFAULT_MODEL);
  const [ contextString, setContextString ] = useState(INITIAL_CONTEXT_STRING);
  const [ context, setContext ] = useState(JSON.parse(INITIAL_CONTEXT_STRING));
  const [ expression, setExpression ] = useState(INITIAL_EXPRESSION);
  const [ prompt, setPrompt ] = useState('Add 1 to foo');
  const [ output, setOutput ] = useState();
  const [ rating, setRating ] = useState(null);
  const [ advanced, setAdvanced ] = useState(false);
  const [ fetching, setFetching ] = useState(false);
  const [ success, setSuccess ] = useState(false);
  const [ failure, setFailure ] = useState(false);

  const [ notifications, setNotifications ] = useState([]);

  const [ evalError, setEvalError ] = useState(null);
  const [ syntaxError, setSyntaxError ] = useState(null);

  const contextEditor = useRef();
  const expressionEditor = useRef();
  const outputViewer = useRef();

  const contextEditorParent = useRef();
  const expressionEditorParent = useRef();
  const outputViewerParent = useRef();

  useEffect(() => {
    expressionEditor.current = new FeelEditor({
      doc: expression,
      context,
      dialect: 'expression',
      onChange: (doc) => setExpression(doc),
      parent: expressionEditorParent.current
    });

    contextEditor.current = new JsonEditor({
      doc: contextString,
      onChange: (doc) => setContextString(doc),
      parent: contextEditorParent.current
    });

    outputViewer.current = new JsonEditor({
      doc: typeof output === 'undefined' ? '' : output,
      parent: outputViewerParent.current,
      readOnly: true
    });
  }, []);

  useEffect(() => {
    try {
      setContext(JSON.parse(contextString));
    } catch (e) {
      console.error('invalid context', e);
    }
  }, [ contextString ]);

  useEffect(() => {
    try {
      const result = evaluateFeel('expression', expression, context);

      setOutput(result);

      setEvalError(null);
      setSyntaxError(null);
    } catch (err) {
      console.error(err);

      if (err instanceof SyntaxError) {
        setSyntaxError(err);
      } else {
        setEvalError(err);
      }

      setOutput(null);
    }
  }, [ expression, context ]);

  useEffect(() => {
    expressionEditor.current.setDoc(expression);
  }, [ expression ]);

  useEffect(() => {
    outputViewer.current.setDoc(
      typeof output !== 'undefined' && JSON.stringify(output, null, 2) || ''
    );
  }, [ output ]);

  useEffect(() => {
    if (!isNil(rating)) {
      const notification = {
        kind: 'info',
        title: 'Feedback submitted'
      };

      setNotifications([ ...notifications, notification ]);
    }
  }, [ rating ]);

  const onGenerate = async () => {
    setFetching(true);
    setSuccess(false);
    setFailure(false);

    const completion = await fetchOpenAICompletion({
      apiKey,
      context: contextString,
      model,
      prompt
    });

    console.log('completion', completion);

    try {
      parseFeel('expression', completion, context);

      setExpression(completion);

      setRating(null);

      setSuccess(true);

      const notification = {
        kind: 'success',
        title: 'Expression generated'
      };

      setNotifications([ ...notifications, notification ]);
    } catch (e) {
      console.error('failed to parse', e);

      setFailure(true);

      const notification = {
        kind: 'error',
        title: 'Failed to generate expression'
      };

      setNotifications([ ...notifications, notification ]);
    }

    setFetching(false);
  };

  return <Fragment>
    <Header aria-label="FEEL Copilot Playground">
      <img src="https://docs.camunda.io/img/black-C.png" style={ { height: '55%', margin: '12px 0 12px 12px' } } />
      <HeaderName href="#" prefix="">
        FEEL Copilot Playground
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Advanced" isActive={ advanced } onClick={ () => setAdvanced(!advanced) }>
          <Settings size={ 20 } />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>

    {
      advanced && <Fragment>
        <Tile>
          <h3>OpenAI Settings</h3>

          <br />

          <TextInput labelText="API Key" id="api-key" value={ apiKey } onChange={ (e) => setApiKey(e.target.value) } />

          <br />

          <TextInput labelText="Model" id="model" value={ model } onChange={ (e) => setModel(e.target.value) } />
        </Tile>

        <br />
      </Fragment>
    }

    <div className="code-editor">
      <div className="code-editor__header">
        <h3>Context</h3>
        <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(contextString) } />
      </div>
      <div className="code-editor__editor" ref={ contextEditorParent }></div>
    </div>

    <br />

    <div className="code-editor">
      <div className="code-editor__header">
        <h3>Prompt</h3>
        <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(prompt) } />
      </div>
      <TextArea spellCheck={ false } labelText="" rows={ 4 } id="prompt" value={ prompt } onChange={ (event) => setPrompt(event.target.value) } />
    </div>

    <br />

    <Button className="generate-button" kind="primary" onClick={ () => onGenerate() } disabled={ fetching }>
      {
        fetching ? <InlineLoading /> : 'Generate'
      }
    </Button>

    <br />
    <br />

    <div className="code-editor">
      <div className="code-editor__header">
        <h3>Expression</h3>
        <div>
          <Button renderIcon={ ThumbsUp } disabled={ fetching || !isNil(rating) } kind={ rating === RATINGS.GOOD ? 'primary' : 'ghost' } iconDescription="Good rating" hasIconOnly onClick={ () => setRating(RATINGS.GOOD) } />
          <Button renderIcon={ ThumbsDown } disabled={ fetching || !isNil(rating) } kind={ rating === RATINGS.BAD ? 'primary' : 'ghost' } iconDescription="Bad rating" hasIconOnly onClick={ () => setRating(RATINGS.BAD) } />
          <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(expression) } />
        </div>
      </div>
      <div className="code-editor__editor" ref={ expressionEditorParent }></div>
      {
        syntaxError && <Fragment>
          <br />
          <Tile className="code-editor__error">
            { syntaxError.message }
          </Tile>
        </Fragment>
      }
    </div>

    <br />

    <div className="code-editor">
      <div className="code-editor__header">
        <h3>Output</h3>
        <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(output) } />
      </div>
      <div className="code-editor__editor" ref={ outputViewerParent }></div>
    </div>

    <div className="notifications">
      {
        notifications.map((notification, index) => {
          return <ToastNotification
            key={ index }
            kind={ notification.kind }
            onClose={ () => {} }
            onCloseButtonClick={ () => {} }
            timeout={ 3000 }
            title={ notification.title }
          />;
        })
      }
    </div>
  </Fragment>;
}