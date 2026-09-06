import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image } from 'lucide-react';

export default function RichTextEditor({ value, onChange, label, required }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if external value is different to avoid cursor jumping
      if (!value) {
        editorRef.current.innerHTML = '';
      } else if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current.focus();
    handleChange();
  };

  const handleChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-bold text-on-surface-variant block">{label}</label>}
      <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-outline-variant/30 bg-surface-container-low">
          <button type="button" onClick={() => exec('bold')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Bold size={16} /></button>
          <button type="button" onClick={() => exec('italic')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Italic size={16} /></button>
          <button type="button" onClick={() => exec('underline')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Underline size={16} /></button>
          <div className="w-px h-5 bg-outline-variant/30 mx-1"></div>
          <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><List size={16} /></button>
          <button type="button" onClick={() => exec('insertOrderedList')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><ListOrdered size={16} /></button>
          <div className="w-px h-5 bg-outline-variant/30 mx-1"></div>
          <button type="button" onClick={() => exec('justifyLeft')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignLeft size={16} /></button>
          <button type="button" onClick={() => exec('justifyCenter')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignCenter size={16} /></button>
          <button type="button" onClick={() => exec('justifyRight')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignRight size={16} /></button>
          <div className="w-px h-5 bg-outline-variant/30 mx-1"></div>
          <button type="button" onClick={insertLink} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Link size={16} /></button>
          <button type="button" onClick={insertImage} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Image size={16} /></button>
        </div>
        
        {/* Editor Area */}
        <div
          ref={editorRef}
          className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
          contentEditable
          onInput={handleChange}
          onBlur={handleChange}
          required={required}
        />
      </div>
    </div>
  );
}
