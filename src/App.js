import React, {
  Fragment,
  useEffect,
  useState
} from 'react';

import {
  Button,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  InlineLoading,
  Popover,
  PopoverContent,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Tile,
  ToastNotification
} from '@carbon/react';

import {
  CheckmarkOutline,
  Copy,
  Help,
  Repeat,
  Settings,
  ThumbsDown,
  ThumbsUp,
  TrashCan
} from '@carbon/icons-react';

import { v4 as uuidv4 } from 'uuid';

import { isNil } from 'min-dash';

import FeelEditorComponent from './FeelEditorComponent';
import JsonEditorComponent from './JsonEditorComponent';

import { parse as parseFeel } from './FeelEngine';

import {
  fetchFineTunedModels,
  fetchOpenAICompletion
} from './OpenAI';

import {
  addLogEntry,
  updateLogEntryFeedback,
  updateLogEntryRating
} from './API';

const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const DEFAULT_MODEL = 'ft:gpt-3.5-turbo-0125:camunda-services-gmbh:feel-240612:9ZGyNJzX';

const fromURLParams = getURLParams();

const DEFAULT_CONTEXT_STRING = JSON.stringify({ foo: 1 }, null, 2);
const DEFAULT_EXPRESSION = 'foo + 1';
const DEFAULT_PROMPT = 'Add 1 to foo';

const INITIAL_CONTEXT_STRING = fromURLParams.context || DEFAULT_CONTEXT_STRING;
const INITIAL_EXPRESSION = fromURLParams.expression || DEFAULT_EXPRESSION;
const INITIAL_PROMPT = fromURLParams.prompt || DEFAULT_PROMPT;

const RATINGS = {
  GOOD: 'good',
  BAD: 'bad'
};

export default function App() {

  /* OpenAI settings */
  const [ apiKey, setApiKey ] = useState('');
  const [ model, setModel ] = useState('');
  const [ models, setModels ] = useState([]);

  const [ contextString, setContextString ] = useState(INITIAL_CONTEXT_STRING);
  const [ context, setContext ] = useState(JSON.parse(INITIAL_CONTEXT_STRING));
  const [ expression, setExpression ] = useState(INITIAL_EXPRESSION);
  const [ correctedExpression, setCorrectedExpression ] = useState('');
  const [ prompt, setPrompt ] = useState(INITIAL_PROMPT);
  const [ rating, setRating ] = useState(null);
  const [ advanced, setAdvanced ] = useState(false);
  const [ logEntry, setLogEntry ] = useState(null);

  const [ userEdited, setUserEdited ] = useState(false);

  const [ notifications, setNotifications ] = useState([]);

  const [ generatingExpression, setGeneratingExpression ] = useState(false);
  const [ expressionGenerated, setExpressionGenerated ] = useState(false);

  const [ submittingFeedback, setSubmittingFeedback ] = useState(false);
  const [ feedbackSubmitted, setFeedbackSubmitted ] = useState(false);

  const [ aboutOpen, setAboutOpen ] = useState(false);

  useEffect(async () => {
    const fineTunedModels = await fetchFineTunedModels({ apiKey: apiKey.length ? apiKey : DEFAULT_OPENAI_API_KEY });

    setModels(fineTunedModels);

    if (!model) {
      setModel(fineTunedModels[ 0 ]);
    }
  }, [ apiKey ]);

  useEffect(() => {
    try {
      setContext(JSON.parse(contextString));
    } catch (e) {
      console.error('invalid context', e);
    }
  }, [ contextString ]);

  useEffect(() => {
    setURLParams({ prompt, expression, context: contextString });
  }, [ prompt, expression, contextString ]);

  const generateExpression = async () => {
    setGeneratingExpression(true);
    setLogEntry(null);
    setCorrectedExpression('');

    setUserEdited(false);
    setFeedbackSubmitted(false);

    const completion = await fetchOpenAICompletion({
      apiKey: apiKey.length ? apiKey : DEFAULT_OPENAI_API_KEY,
      context: contextString,
      model: model.length ? model : DEFAULT_MODEL,
      prompt
    });

    try {
      parseFeel('expression', completion, context);

      setExpression(completion);
      setCorrectedExpression(completion);

      setRating(null);

      const notification = {
        kind: 'success',
        title: 'Expression generated'
      };

      setNotifications([ ...notifications, notification ]);

      const logEntry = createLogEntry({
        model: model.length ? model : DEFAULT_MODEL,
        context: contextString,
        expression: completion,
        prompt
      });

      setLogEntry(logEntry);

      addLogEntry(logEntry);
    } catch (e) {
      console.error('failed to parse', e);

      const notification = {
        kind: 'error',
        title: 'Failed to generate expression'
      };

      setNotifications([ ...notifications, notification ]);

      const logEntry = createLogEntry({
        model: model.length ? model : DEFAULT_MODEL,
        context: contextString,
        expression: completion,
        prompt,
        error: e.message
      });

      setLogEntry(logEntry);

      addLogEntry(logEntry);
    }

    setGeneratingExpression(false);
    setExpressionGenerated(true);
  };

  const submitRating = async (rating) => {
    setRating(rating);

    await updateLogEntryRating(logEntry.id, rating);

    const notification = {
      kind: 'success',
      title: 'Feedback submitted'
    };

    setNotifications([ ...notifications, notification ]);
  };

  const submitFeedback = async () => {
    setSubmittingFeedback(true);

    await updateLogEntryFeedback(logEntry.id, correctedExpression);

    setSubmittingFeedback(false);
    setFeedbackSubmitted(true);

    const notification = {
      kind: 'success',
      title: 'Feedback submitted'
    };

    setNotifications([ ...notifications, notification ]);
  };

  return <Fragment>
    <div className="app-inner">
      <Header aria-label="FEEL Copilot Playground">
        <img src="https://docs.camunda.io/img/black-C.png" style={ { height: '55%', margin: '12px 0 12px 12px' } } />
        <HeaderName href="#" prefix="">
          FEEL Copilot Playground
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Advanced" isActive={ advanced } onClick={ () => setAdvanced(!advanced) }>
            <Settings size={ 20 } />
          </HeaderGlobalAction>
          <Popover align={ 'bottom-right' } open={ aboutOpen } dropShadow={ true } caret={ false }>
            <HeaderGlobalAction aria-label="About" onClick={ () => setAboutOpen(!aboutOpen) }>
              <Help size={ 20 } />
            </HeaderGlobalAction>
            <PopoverContent>
              <Tile className="about">
                <h3>About</h3>
                <p>This is a playground for generating FEEL expressions using a fine-tuned OpenAI GPT-3.5 model.</p>
                <br />
                <p>Enter a prompt that describes the expression you want to generate and provide a context in which the expression should be evaluated.</p>
                <br />
                <p>Click <strong>Generate</strong> to generate an expression based on the prompt and context.</p>
                <br />
                <p>Rate the generated expression as <ThumbsUp /> or <ThumbsDown /> to provide feedback on the quality of the generated expression.</p>
                <br />
                <p>If you rate the expression as <ThumbsDown />, you can provide a corrected expression to help improve the model.</p>
              </Tile>
            </PopoverContent>
          </Popover>
        </HeaderGlobalBar>
      </Header>
      {
        advanced && <Fragment>
          <Tile>
            <h3>OpenAI Settings</h3>
            <TextInput className="input-openai-settings" labelText="API Key" id="api-key" value={ apiKey } placeholder="Enter API key" onChange={ (e) => setApiKey(e.target.value) } />
            <Select
              id="model"
              className="input-openai-settings"
              labelText="Model"
              onChange={ (e) => setModel(e.target.value) }>
              {
                models.map((model) => {
                  return <SelectItem key={ model } value={ model } text={ model } />;
                })
              }
            </Select>
          </Tile>
        </Fragment>
      }
      <div className="code-editor">
        <div className="code-editor__header">
          <h3>Prompt</h3>
          <div>
            <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(prompt) } />
            <Button renderIcon={ TrashCan } kind="ghost" iconDescription="Clear" hasIconOnly onClick={ () => setPrompt('') } />
          </div>
        </div>
        <TextArea spellCheck={ false } labelText="" rows={ 4 } id="prompt" value={ prompt } onChange={ (event) => {
          setPrompt(event.target.value);

          setUserEdited(true);
        } } />
      </div>
      <JsonEditorComponent
        json={ contextString }
        onChange={ (value) => {
          setContextString(value);

          setUserEdited(true);
        } }
        title="Context" />
      <Button className="button-generate" renderIcon={ expressionGenerated && !userEdited ? Repeat : null } kind="primary" onClick={ () => generateExpression() } disabled={ generatingExpression }>
        {
          generatingExpression ? <InlineLoading /> : 'Generate'
        }
      </Button>
      <FeelEditorComponent
        context={ context }
        expression={ expression }
        onExpressionChange={ (value) => {
          setExpression(value);

          setUserEdited(true);
        } }
        title="Expression" />
      {
        expressionGenerated && !generatingExpression && !userEdited && <Fragment>
          <div>
            <Button className="feedback-button-good" renderIcon={ ThumbsUp } disabled={ generatingExpression || !isNil(rating) } kind="primary" iconDescription="Good rating" hasIconOnly onClick={ () => submitRating(RATINGS.GOOD) } />
            <Button className="feedback-button-bad" renderIcon={ ThumbsDown } disabled={ generatingExpression || !isNil(rating) } kind="primary" iconDescription="Bad rating" hasIconOnly onClick={ () => submitRating(RATINGS.BAD) } />
          </div>
        </Fragment>
      }
      {
        rating === RATINGS.BAD && expressionGenerated && !generatingExpression && !userEdited && <Fragment>
          <FeelEditorComponent
            context={ context }
            expression={ correctedExpression }
            onExpressionChange={ setCorrectedExpression }
            description="Thank you for your feedback. Please provide a corrected expression to help improve the model." />
          <Button className="button-feedback" kind="primary" renderIcon={ feedbackSubmitted ? CheckmarkOutline : null } onClick={ submitFeedback } disabled={ !correctedExpression.length || submittingFeedback || feedbackSubmitted }>
            {
              submittingFeedback ? <InlineLoading /> : feedbackSubmitted ? 'Submitted' : 'Submit'
            }
          </Button>
        </Fragment>
      }
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
    </div>
    <footer>Copyright © { getCurrentYear() } <a href="https://camunda.com" target="_blank">Camunda</a></footer>
  </Fragment>;
}

function createLogEntry({ expression, context, model, prompt }) {
  return {
    id: uuidv4(),
    context,
    expression,
    feedback: null,
    model,
    prompt,
    rating: null,
    timestamp: Date.now()
  };
}

/**
 * Gets prompt, expression and context from URL parameters.
 */
function getURLParams() {
  const urlParams = new URLSearchParams(window.location.search);

  const prompt = urlParams.get('prompt');
  const expression = urlParams.get('expression');
  const context = urlParams.get('context');

  return {
    prompt: isNil(prompt) ? null : decodeURIComponent(prompt),
    expression: isNil(expression) ? null : decodeURIComponent(expression),
    context: isNil(context) ? null : decodeURIComponent(context)
  };
}

/**
 * Sets prompt, expression and context as URL parameters.
 */
function setURLParams({ prompt, expression, context }) {
  const url = new URL(window.location.href);

  url.searchParams.set('prompt', encodeURIComponent(prompt));
  url.searchParams.set('expression', encodeURIComponent(expression));
  url.searchParams.set('context', encodeURIComponent(context));

  window.history.replaceState({}, '', url);
}

function getCurrentYear() {
  return new Date().getFullYear();
}