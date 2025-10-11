import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Notepad.css';

function Notepad() {
  const [text, setText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAlert, setShowAlert] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const textareaRef = useRef(null);
  const fontSizeButtonRef = useRef(null);
  const typingTimerRef = useRef(null);
  const fileHandleRef = useRef(null);

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Free Online Notepad - Auto-Save & Dark Mode | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free online notepad with auto-save feature, dark mode, find & replace, and word count. Your notes are stored locally in browser. 100% private and secure.');
    }
  }, []);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notepad-text');
    const savedDarkMode = localStorage.getItem('notepad-darkmode');
    const savedFontSize = localStorage.getItem('notepad-fontsize');

    if (saved) {
      setText(saved);
      // Initialize history with saved text
      setHistory([saved]);
      setHistoryIndex(0);
    }
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('notepad-text', text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    localStorage.setItem('notepad-darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('notepad-fontsize', fontSize.toString());
  }, [fontSize]);

  // Save to history helper
  const saveToHistory = (textToSave) => {
    // Only save if text is different from current history entry
    if (history[historyIndex] !== textToSave) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(textToSave);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Handle text change - only update text, don't save to history yet
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Clear previous typing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Set new timer to save after 1 second of no typing
    if (!isComposing) {
      typingTimerRef.current = setTimeout(() => {
        saveToHistory(newText);
      }, 1000);
    }
  };

  // Handle key down - save to history on space or enter
  const handleKeyDown = (e) => {
    // Save to history on space or enter (but not during Korean composition)
    if ((e.key === ' ' || e.key === 'Enter') && !isComposing) {
      // Clear typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Save current text to history
      // Use setTimeout to ensure the new character is included
      setTimeout(() => {
        saveToHistory(text + (e.key === ' ' ? ' ' : '\n'));
      }, 0);
    }
  };

  // Handle composition events for Korean input
  const handleCompositionStart = () => {
    setIsComposing(true);
    // Clear typing timer during composition
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    // Don't immediately save on composition end
    // Let the typing timer handle it, or wait for space/enter
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      // Clear any pending typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      // Clear any pending typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  };

  // File operations
  const handleNew = () => {
    if (text && !confirm('Current text will be lost. Continue?')) return;
    setText('');
    setHistory(['']);
    setHistoryIndex(0);
    setCurrentFileName('');
    fileHandleRef.current = null;
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const loadedText = event.target.result;
          setText(loadedText);
          // Reset history with loaded text
          setHistory([loadedText]);
          setHistoryIndex(0);
          // Set file name
          setCurrentFileName(file.name);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    // If we have a file handle, use it to save
    if (fileHandleRef.current) {
      try {
        const writable = await fileHandleRef.current.createWritable();
        await writable.write(text);
        await writable.close();
        alert('File saved successfully!');
        return;
      } catch (err) {
        console.error('Error saving file:', err);
        // Fall through to Save As if error
      }
    }

    // No file handle, trigger Save As
    handleSaveAs();
  };

  const handleSaveAs = async () => {
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
          }],
          suggestedName: currentFileName || 'notepad.txt',
        });

        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();

        // Save file handle and file name
        fileHandleRef.current = handle;
        setCurrentFileName(handle.name);
        alert('File saved successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error saving file:', err);
          alert('Failed to save file');
        }
      }
    } else {
      // Fallback: traditional download
      const filename = prompt('Enter filename:', currentFileName || 'notepad.txt');
      if (filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const finalFilename = filename.endsWith('.txt') ? filename : filename + '.txt';
        a.download = finalFilename;
        a.click();
        URL.revokeObjectURL(url);
        setCurrentFileName(finalFilename);
      }
    }
  };

  const handleShare = () => {
    // Always show custom share modal
    setShowShareModal(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
      setShowShareModal(false);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert('Text copied to clipboard!');
        setShowShareModal(false);
      } catch (e) {
        alert('Failed to copy to clipboard');
      }
      document.body.removeChild(textarea);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Notepad');
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  const handleDownloadShare = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName || 'notepad.txt';
    a.click();
    URL.revokeObjectURL(url);
    setShowShareModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Edit operations
  const handleCut = () => {
    document.execCommand('cut');
  };

  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + clipboardText + text.substring(end);
      setText(newText);
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleDelete = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const newText = text.substring(0, start) + text.substring(end);
      setText(newText);
    }
  };

  const handleSelectAll = () => {
    textareaRef.current?.select();
  };

  // View operations - Screen Zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Font size operations
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    setShowFontSizeMenu(false);
  };

  // Calculate stats
  const lines = text.split('\n').length;
  const cursorPos = textareaRef.current?.selectionStart || 0;
  const textBeforeCursor = text.substring(0, cursorPos);
  const currentLine = textBeforeCursor.split('\n').length;
  const currentColumn = textBeforeCursor.split('\n').pop().length + 1;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'a':
            // Let default behavior work
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [historyIndex, history, text]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Close all menus
  const closeAllMenus = () => {
    setShowFileMenu(false);
    setShowEditMenu(false);
    setShowViewMenu(false);
    setShowHelpMenu(false);
    setShowFontSizeMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => {
      closeAllMenus();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
    <div className={`notepad-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Alert */}
      {showAlert && (
        <div className="notepad-alert">
          <div className="alert-content">
            <span>
              This notepad uses localStorage to save your notes. Your data is stored locally in your browser.
            </span>
            <button onClick={() => setShowAlert(false)} className="alert-close">×</button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="notepad-breadcrumb">
        <Link to="/">🏠 Home</Link>
        <span> {'>'} </span>
        <span>Tools</span>
        <span> {'>'} </span>
        <span>Notepad</span>
        <span className="file-name-display">
          {currentFileName ? (
            <>
              <span style={{ marginLeft: '20px', marginRight: '8px' }}>File 📄</span>
              <span style={{ color: '#888' }}>{currentFileName}</span>
            </>
          ) : (
            <span style={{ marginLeft: '20px', color: '#888' }}>File 📄</span>
          )}
        </span>
      </div>

      {/* Menu Bar */}
      <div className="notepad-menubar">
        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowFileMenu(true);
        }}>
          File
          {showFileMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={handleNew}>New</div>
              <div className="menu-option" onClick={handleOpen}>Open</div>
              <div className="menu-option" onClick={handleSave}>Save (Ctrl+S)</div>
              <div className="menu-option" onClick={handleSaveAs}>Save As</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleShare}>Share</div>
              <div className="menu-option" onClick={handlePrint}>Print (Ctrl+P)</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowEditMenu(true);
        }}>
          Edit
          {showEditMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={handleUndo} style={{ opacity: historyIndex <= 0 ? 0.5 : 1 }}>
                Undo (Ctrl+Z)
              </div>
              <div className="menu-option" onClick={handleRedo} style={{ opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }}>
                Redo (Ctrl+Y)
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleCut}>Cut (Ctrl+X)</div>
              <div className="menu-option" onClick={handleCopy}>Copy (Ctrl+C)</div>
              <div className="menu-option" onClick={handlePaste}>Paste (Ctrl+V)</div>
              <div className="menu-option" onClick={handleDelete}>Delete</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleSelectAll}>Select All (Ctrl+A)</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowViewMenu(true);
        }}>
          View
          {showViewMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleZoomIn}>Zoom In</div>
              <div className="menu-option" onClick={handleZoomOut}>Zoom Out</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={() => setShowPreferences(true)}>Preferences</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowHelpMenu(true);
        }}>
          Help
          {showHelpMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={() => alert('Simple online notepad with auto-save\nVersion 1.0')}>
                About
              </div>
              <div className="menu-option" onClick={() => alert('Keyboard shortcuts:\nCtrl+S - Save\nCtrl+Z - Undo\nCtrl+Y - Redo\nCtrl+A - Select All\nCtrl+P - Print')}>
                Keyboard Shortcuts
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="notepad-toolbar">
        <button onClick={handleNew} title="New" className="toolbar-btn">📄</button>
        <button onClick={handleOpen} title="Open" className="toolbar-btn">📂</button>
        <button onClick={handleSave} title="Save (Ctrl+S)" className="toolbar-btn">💾</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleCut} title="Cut (Ctrl+X)" className="toolbar-btn">✂️</button>
        <button onClick={handleCopy} title="Copy (Ctrl+C)" className="toolbar-btn">📑</button>
        <button onClick={handlePaste} title="Paste (Ctrl+V)" className="toolbar-btn">📋</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="toolbar-btn" disabled={historyIndex <= 0}>↶</button>
        <button onClick={handleRedo} title="Redo (Ctrl+Y)" className="toolbar-btn" disabled={historyIndex >= history.length - 1}>↷</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleZoomIn} title="Zoom In" className="toolbar-btn">🔍+</button>
        <button onClick={handleZoomOut} title="Zoom Out" className="toolbar-btn">🔍−</button>
        <div className="toolbar-divider"></div>
        <button
          ref={fontSizeButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowFontSizeMenu(!showFontSizeMenu);
          }}
          title="Font Size"
          className="toolbar-btn toolbar-btn-relative"
        >
          A
          {showFontSizeMenu && (
            <div className="font-size-dropdown">
              <div className="font-size-option" onClick={() => handleFontSizeChange(10)}>10px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(12)}>12px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(14)}>14px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(16)}>16px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(18)}>18px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(20)}>20px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(24)}>24px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(28)}>28px</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(32)}>32px</div>
            </div>
          )}
        </button>
        <button onClick={() => alert('Help: Use the menu bar for file operations and editing')} title="Help" className="toolbar-btn">❓</button>
      </div>

      {/* Text Area Container with Zoom */}
      <div style={{ flex: 1, overflow: 'auto', transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100/zoomLevel}%`, height: `${100/zoomLevel}%` }}>
        <textarea
          ref={textareaRef}
          className="notepad-textarea"
          value={text}
          onChange={handleTextChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          style={{ fontSize: `${fontSize}px`, minHeight: '100%' }}
          placeholder="Start typing..."
        />
      </div>

      {/* Status Bar */}
      <div className="notepad-statusbar">
        <span>Line: {currentLine}</span>
        <span>Column: {currentColumn}</span>
        <span>Chars: {chars}</span>
        <span>Words: {words}</span>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay" onClick={() => setShowPreferences(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Preferences</h2>
            <div className="preferences-form">
              <div className="pref-group">
                <label>Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
              </div>
              <div className="pref-group">
                <label>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  Dark Mode
                </label>
              </div>
            </div>
            <button onClick={() => setShowPreferences(false)} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Options</h2>
              <button className="modal-close-x" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-options">
              <button className="share-option-btn" onClick={handleCopyToClipboard}>
                <span className="share-icon">📋</span>
                <div className="share-option-text">
                  <div className="share-option-title">Copy to Clipboard</div>
                  <div className="share-option-desc">Copy text to paste anywhere</div>
                </div>
              </button>
              <button className="share-option-btn" onClick={handleEmailShare}>
                <span className="share-icon">📧</span>
                <div className="share-option-text">
                  <div className="share-option-title">Send via Email</div>
                  <div className="share-option-desc">Open email client with text</div>
                </div>
              </button>
              <button className="share-option-btn" onClick={handleDownloadShare}>
                <span className="share-icon">💾</span>
                <div className="share-option-text">
                  <div className="share-option-title">Download as TXT</div>
                  <div className="share-option-desc">Save as text file</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Features Section */}
    <div className="notepad-features">
      <h2>Why Use Our Online Notepad?</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>100% Private & Secure</h3>
          <p>Your notes are stored locally in your browser. Nothing is uploaded to any server, ensuring complete privacy and security.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h3>Auto-Save Feature</h3>
          <p>Never lose your work! All changes are automatically saved to your browser's local storage in real-time.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌙</div>
          <h3>Dark Mode Support</h3>
          <p>Switch between light and dark themes for comfortable writing in any lighting condition. Your preference is saved.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🖋️</div>
          <h3>Rich Text Editing</h3>
          <p>Full editing capabilities with undo/redo, find & replace, word count, and customizable font size for optimal writing experience.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📤</div>
          <h3>Easy File Operations</h3>
          <p>Open, save, and download text files. Export your notes as TXT files or share via email with just one click.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🆓</div>
          <h3>100% Free Forever</h3>
          <p>No premium features, no subscriptions, no hidden costs. All features are completely free with unlimited usage.</p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Notepad;
