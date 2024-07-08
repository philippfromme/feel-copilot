import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Button
} from '@carbon/react';

import {
  Copy,
  TrashCan
} from '@carbon/icons-react';

import JsonEditor from './editors/JsonEditor';

export default function JsonEditorComponent({
  allowClear = true,
  allowCopy = true,
  description,
  json,
  onChange,
  title
}) {
  const [ editor, setEditor ] = useState(null);

  const ref = useRef(null);

  useEffect(() => {
    setEditor(new JsonEditor({
      doc: json,
      onChange: (doc) => {
        if (doc !== json) {
          onChange(doc);
        }
      },
      parent: ref.current
    }));
  }, []);

  useEffect(() => {
    if (editor && json !== editor._cm.state.doc.toString()) {
      editor.setDoc(json);
    }
  }, [ json ]);

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
          allowCopy && <Button renderIcon={ Copy } kind="ghost" iconDescription="Copy" hasIconOnly onClick={ () => navigator.clipboard.writeText(json) } />
        }
        {
          allowClear && <Button renderIcon={ TrashCan } kind="ghost" iconDescription="Clear" hasIconOnly onClick={ () => onChange('') } />
        }
      </div>
    </div>
    <div className="code-editor__editor" ref={ ref }></div>
  </div>;
}