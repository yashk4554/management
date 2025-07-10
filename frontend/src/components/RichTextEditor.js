import React from 'react';

const RichTextEditor = ({ value, onChange }) => {
  // Simple rich text editor using contentEditable
  return (
    <div
      contentEditable
      style={{
        minHeight: 80,
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        background: '#fff',
        outline: 'none',
      }}
      onInput={e => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};

export default RichTextEditor;
