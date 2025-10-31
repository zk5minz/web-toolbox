import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './Notepad.css';

function Notepad() {
  const { t, i18n } = useTranslation(['notepad', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/notepad');
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
    document.title = t('notepad:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('notepad:metaDescription'));
    }
  }, [t, i18n.language]);

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
    if (text && !confirm(t('notepad:messages.confirmNew'))) return;
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
        alert(t('notepad:messages.fileSaved'));
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
          alert(t('notepad:messages.saveFailed'));
        }
      }
    } else {
      // Fallback: traditional download
      const filename = prompt(t('notepad:messages.enterFilename'), currentFileName || 'notepad.txt');
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
      alert(t('notepad:messages.copiedToClipboard'));
      setShowShareModal(false);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert(t('notepad:messages.copiedToClipboard'));
        setShowShareModal(false);
      } catch (e) {
        alert(t('notepad:messages.copyFailed'));
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
              {t('notepad:alert')}
            </span>
            <button onClick={() => setShowAlert(false)} className="alert-close">×</button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="notepad-breadcrumb">
        <Link to="/">🏠 {t('translation:nav.home')}</Link>
        <span> {'>'} </span>
        <span>{t('translation:nav.tools')}</span>
        <span> {'>'} </span>
        <span>{t('notepad:breadcrumb.notepad')}</span>
        <span className="file-name-display">
          {currentFileName ? (
            <>
              <span style={{ marginLeft: '20px', marginRight: '8px' }}>{t('notepad:breadcrumb.file')} 📄</span>
              <span style={{ color: '#888' }}>{currentFileName}</span>
            </>
          ) : (
            <span style={{ marginLeft: '20px', color: '#888' }}>{t('notepad:breadcrumb.file')} 📄</span>
          )}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Menu Bar */}
      <div className="notepad-menubar">
        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowFileMenu(true);
        }}>
          {t('notepad:menu.file')}
          {showFileMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={handleNew}>{t('notepad:fileMenu.new')}</div>
              <div className="menu-option" onClick={handleOpen}>{t('notepad:fileMenu.open')}</div>
              <div className="menu-option" onClick={handleSave}>{t('notepad:fileMenu.save')}</div>
              <div className="menu-option" onClick={handleSaveAs}>{t('notepad:fileMenu.saveAs')}</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleShare}>{t('notepad:fileMenu.share')}</div>
              <div className="menu-option" onClick={handlePrint}>{t('notepad:fileMenu.print')}</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowEditMenu(true);
        }}>
          {t('notepad:menu.edit')}
          {showEditMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={handleUndo} style={{ opacity: historyIndex <= 0 ? 0.5 : 1 }}>
                {t('notepad:editMenu.undo')}
              </div>
              <div className="menu-option" onClick={handleRedo} style={{ opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }}>
                {t('notepad:editMenu.redo')}
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleCut}>{t('notepad:editMenu.cut')}</div>
              <div className="menu-option" onClick={handleCopy}>{t('notepad:editMenu.copy')}</div>
              <div className="menu-option" onClick={handlePaste}>{t('notepad:editMenu.paste')}</div>
              <div className="menu-option" onClick={handleDelete}>{t('notepad:editMenu.delete')}</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleSelectAll}>{t('notepad:editMenu.selectAll')}</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowViewMenu(true);
        }}>
          {t('notepad:menu.view')}
          {showViewMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? t('notepad:viewMenu.lightMode') : t('notepad:viewMenu.darkMode')}
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleZoomIn}>{t('notepad:viewMenu.zoomIn')}</div>
              <div className="menu-option" onClick={handleZoomOut}>{t('notepad:viewMenu.zoomOut')}</div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={() => setShowPreferences(true)}>{t('notepad:viewMenu.preferences')}</div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={(e) => {
          e.stopPropagation();
          closeAllMenus();
          setShowHelpMenu(true);
        }}>
          {t('notepad:menu.help')}
          {showHelpMenu && (
            <div className="dropdown-menu">
              <div className="menu-option" onClick={() => alert(t('notepad:helpMenu.aboutText'))}>
                {t('notepad:helpMenu.about')}
              </div>
              <div className="menu-option" onClick={() => alert(t('notepad:helpMenu.shortcutsText'))}>
                {t('notepad:helpMenu.shortcuts')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="notepad-toolbar">
        <button onClick={handleNew} title={t('notepad:toolbar.new')} className="toolbar-btn">📄</button>
        <button onClick={handleOpen} title={t('notepad:toolbar.open')} className="toolbar-btn">📂</button>
        <button onClick={handleSave} title={t('notepad:toolbar.save')} className="toolbar-btn">💾</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleCut} title={t('notepad:toolbar.cut')} className="toolbar-btn">✂️</button>
        <button onClick={handleCopy} title={t('notepad:toolbar.copy')} className="toolbar-btn">📑</button>
        <button onClick={handlePaste} title={t('notepad:toolbar.paste')} className="toolbar-btn">📋</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleUndo} title={t('notepad:toolbar.undo')} className="toolbar-btn" disabled={historyIndex <= 0}>↶</button>
        <button onClick={handleRedo} title={t('notepad:toolbar.redo')} className="toolbar-btn" disabled={historyIndex >= history.length - 1}>↷</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleZoomIn} title={t('notepad:toolbar.zoomIn')} className="toolbar-btn">🔍+</button>
        <button onClick={handleZoomOut} title={t('notepad:toolbar.zoomOut')} className="toolbar-btn">🔍−</button>
        <div className="toolbar-divider"></div>
        <button
          ref={fontSizeButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowFontSizeMenu(!showFontSizeMenu);
          }}
          title={t('notepad:toolbar.fontSize')}
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
        <button onClick={() => alert(t('notepad:helpMenu.aboutText'))} title={t('notepad:toolbar.help')} className="toolbar-btn">❓</button>
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
          placeholder={t('notepad:placeholder')}
        />
      </div>

      {/* Status Bar */}
      <div className="notepad-statusbar">
        <span>{t('notepad:statusBar.line')}: {currentLine}</span>
        <span>{t('notepad:statusBar.column')}: {currentColumn}</span>
        <span>{t('notepad:statusBar.chars')}: {chars}</span>
        <span>{t('notepad:statusBar.words')}: {words}</span>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay" onClick={() => setShowPreferences(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('notepad:preferences.title')}</h2>
            <div className="preferences-form">
              <div className="pref-group">
                <label>{t('notepad:preferences.fontSize')}: {fontSize}px</label>
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
                  {t('notepad:preferences.darkMode')}
                </label>
              </div>
            </div>
            <button onClick={() => setShowPreferences(false)} className="modal-close-btn">{t('notepad:preferences.close')}</button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('notepad:share.title')}</h2>
              <button className="modal-close-x" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-options">
              <button className="share-option-btn" onClick={handleCopyToClipboard}>
                <span className="share-icon">📋</span>
                <div className="share-option-text">
                  <div className="share-option-title">{t('notepad:share.copyClipboard.title')}</div>
                  <div className="share-option-desc">{t('notepad:share.copyClipboard.description')}</div>
                </div>
              </button>
              <button className="share-option-btn" onClick={handleEmailShare}>
                <span className="share-icon">📧</span>
                <div className="share-option-text">
                  <div className="share-option-title">{t('notepad:share.email.title')}</div>
                  <div className="share-option-desc">{t('notepad:share.email.description')}</div>
                </div>
              </button>
              <button className="share-option-btn" onClick={handleDownloadShare}>
                <span className="share-icon">💾</span>
                <div className="share-option-text">
                  <div className="share-option-title">{t('notepad:share.download.title')}</div>
                  <div className="share-option-desc">{t('notepad:share.download.description')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Features Section */}
    <div className="notepad-features">
      <h2>{t('notepad:features.title')}</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>{t('notepad:features.privateSecure.title')}</h3>
          <p>{t('notepad:features.privateSecure.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h3>{t('notepad:features.autoSave.title')}</h3>
          <p>{t('notepad:features.autoSave.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌙</div>
          <h3>{t('notepad:features.darkMode.title')}</h3>
          <p>{t('notepad:features.darkMode.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🖋️</div>
          <h3>{t('notepad:features.richText.title')}</h3>
          <p>{t('notepad:features.richText.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📤</div>
          <h3>{t('notepad:features.fileOps.title')}</h3>
          <p>{t('notepad:features.fileOps.description')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🆓</div>
          <h3>{t('notepad:features.free.title')}</h3>
          <p>{t('notepad:features.free.description')}</p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Notepad;
