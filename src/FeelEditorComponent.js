import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Button,
  Tile
} from '@carbon/react';

import {
  Copy,
  TrashCan,
  Play
} from '@carbon/icons-react';

import { isNil } from 'min-dash';

import FeelEditor from './editors/FeelEditor';

import {
  evaluate as evaluateFeel,
  SyntaxError
} from './FeelEngine';

export default function FeeEditorComponent({
  allowClear = true,
  allowCopy = true,
  context = {},
  description,
  dialect = 'expression',
  expression,
  onExpressionChange,
  onOutputChange = () => {},
  title,
  showOutput = true
}) {
  const [ editor, setEditor ] = useState(null);
  const [ output, setOutput ] = useState(null);
  const [ evalError, setEvalError ] = useState(null);
  const [ syntaxError, setSyntaxError ] = useState(null);

  const ref = useRef(null);

  useEffect(() => {
    setEditor(new FeelEditor({
      doc: expression,
      context,
      dialect,
      onChange: doc => {
        if (doc !== expression) {
          onExpressionChange(doc);
        }
      },
      parent: ref.current
    }));
  }, []);

  useEffect(() => {
    if (editor && expression !== editor._cm.state.doc.toString()) {
      editor.setDoc(expression);
    }
  }, [ expression ]);

  useEffect(() => {
    try {
      const result = evaluateFeel(dialect, expression, context);

      setOutput(JSON.stringify(result, null, 2));

      onOutputChange(result);

      setEvalError(null);
      setSyntaxError(null);
    } catch (error) {
      setOutput(null);

      onOutputChange(null);

      if (error instanceof SyntaxError) {
        setSyntaxError(error);
      } else {
        setEvalError(error);
      }
    }
  }, [ expression, context ]);

  return <div className="code-editor">
    <div className="code-editor__header">
      {
        title && <h3>{ title }</h3>
      }
      {
        description && <p className="code-editor__description">{ description }</p>
      }
      <div className="code-editor__actions">
        {
          allowCopy && <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(expression) } />
        }
        {
          allowClear && <Button renderIcon={ TrashCan } kind="ghost" iconDescription="Clear" hasIconOnly onClick={ () => onExpressionChange('') } />
        }
      </div>
    </div>
    <div className="code-editor__editor" ref={ ref }></div>
    {
      showOutput && !syntaxError && <Tile className="code-editor__output">
        <Play size={ 14 } />
        <code>
          { isNil(output) ? 'null' : output }
        </code>
      </Tile>
    }
    {
      showOutput && evalError && <Tile className="code-editor__output code-editor__output-error">
        { evalError.message }
      </Tile>
    }
    {
      syntaxError && <Tile className="code-editor__error">
        { syntaxError.message }
      </Tile>
    }
  </div>;
}