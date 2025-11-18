import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeaderControls from '../components/HeaderControls';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './Notepad.css';

function Notepad() {
  const { t, i18n } = useTranslation(['notepad', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/notepad');
  
  // 탭 관련 상태
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem('notepad-tabs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [{
          id: 1,
          name: 'Untitled 1',
          text: '',
          history: [''],
          historyIndex: 0,
          fileName: '',
          isModified: false
        }];
      }
    }
    return [{
      id: 1,
      name: 'Untitled 1',
      text: '',
      history: [''],
      historyIndex: 0,
      fileName: '',
      isModified: false
    }];
  });
  const [activeTabId, setActiveTabId] = useState(() => {
    const saved = localStorage.getItem('notepad-active-tab');
    return saved ? parseInt(saved) : 1;
  });
  const [nextTabId, setNextTabId] = useState(() => {
    const maxId = Math.max(...tabs.map(t => t.id));
    return maxId + 1;
  });
  
  // 현재 활성 탭 찾기
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  // 전역 테마 감지
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [fontSize, setFontSize] = useState(14);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAlert, setShowAlert] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const fontSizeButtonRef = useRef(null);
  const typingTimerRef = useRef(null);

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
    const savedFontSize = localStorage.getItem('notepad-fontsize');
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  // 전역 테마 변경 감지
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Auto-save tabs to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('notepad-tabs', JSON.stringify(tabs));
      localStorage.setItem('notepad-active-tab', activeTabId.toString());
    }, 500);
    return () => clearTimeout(timer);
  }, [tabs, activeTabId]);

  // 메모장 내부에서 다크모드 토글 시 전역 테마도 변경
  const handleToggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    localStorage.setItem('notepad-fontsize', fontSize.toString());
  }, [fontSize]);

  // 탭 업데이트 헬퍼 함수
  const updateTab = (tabId, updates) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  // Save to history helper
  const saveToHistory = (textToSave) => {
    const currentHistory = activeTab.history;
    const currentIndex = activeTab.historyIndex;
    
    if (currentHistory[currentIndex] !== textToSave) {
      const newHistory = currentHistory.slice(0, currentIndex + 1);
      newHistory.push(textToSave);
      updateTab(activeTabId, { 
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      });
    }
  };

  // Handle text change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    updateTab(activeTabId, { text: newText, isModified: true });

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    if (!isComposing) {
      typingTimerRef.current = setTimeout(() => {
        saveToHistory(newText);
      }, 1000);
    }
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !isComposing) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      setTimeout(() => {
        saveToHistory(activeTab.text + (e.key === ' ' ? ' ' : '\n'));
      }, 0);
    }
  };

  // Handle composition events
  const handleCompositionStart = () => {
    setIsComposing(true);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Undo/Redo
  const handleUndo = () => {
    if (activeTab.historyIndex > 0) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      const newIndex = activeTab.historyIndex - 1;
      updateTab(activeTabId, {
        text: activeTab.history[newIndex],
        historyIndex: newIndex
      });
    }
  };

  const handleRedo = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      const newIndex = activeTab.historyIndex + 1;
      updateTab(activeTabId, {
        text: activeTab.history[newIndex],
        historyIndex: newIndex
      });
    }
  };

  // 새 탭 생성
  const handleNewTab = () => {
    const newTab = {
      id: nextTabId,
      name: `Untitled ${nextTabId}`,
      text: '',
      history: [''],
      historyIndex: 0,
      fileName: '',
      isModified: false
    };
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  // 탭 닫기
  const handleCloseTab = (tabId, e) => {
    e.stopPropagation();
    
    if (tabs.length === 1) {
      alert(t('notepad:messages.cannotCloseLastTab') || '마지막 탭은 닫을 수 없습니다.');
      return;
    }

    const tabToClose = tabs.find(t => t.id === tabId);
    if (tabToClose.isModified && tabToClose.text) {
      if (!confirm(t('notepad:messages.confirmCloseTab') || '저장되지 않은 변경사항이 있습니다. 탭을 닫으시겠습니까?')) {
        return;
      }
    }

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const currentIndex = tabs.findIndex(t => t.id === tabId);
      const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1] || newTabs[0];
      setActiveTabId(nextTab.id);
    }
  };

  // 탭 전환
  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
  };

  // File operations
  const handleNewWindow = () => {
    // 현재 URL로 새 창 열기
    window.open(window.location.href, '_blank');
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
          updateTab(activeTabId, {
            text: loadedText,
            history: [loadedText],
            historyIndex: 0,
            fileName: file.name,
            name: file.name,
            isModified: false
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = async () => {
    // Get plain text content for saving
    const textToSave = getTextContent(activeTab.text);
    
    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          types: [{
            description: 'Text Files',
            accept: { 'text/plain': ['.txt'] },
          }],
          suggestedName: activeTab.fileName || `${activeTab.name}.txt`,
        });

        const writable = await handle.createWritable();
        await writable.write(textToSave);
        await writable.close();

        updateTab(activeTabId, {
          fileName: handle.name,
          name: handle.name,
          isModified: false
        });
        alert(t('notepad:messages.fileSaved'));
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error saving file:', err);
          alert(t('notepad:messages.saveFailed'));
        }
      }
    } else {
      // Fallback: traditional download
      handleSaveAs();
    }
  };

  const handleSaveAs = async () => {
    const filename = prompt(t('notepad:messages.enterFilename'), activeTab.fileName || `${activeTab.name}.txt`);
    if (filename) {
      const textToSave = getTextContent(activeTab.text);
      const blob = new Blob([textToSave], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const finalFilename = filename.endsWith('.txt') ? filename : filename + '.txt';
      a.download = finalFilename;
      a.click();
      URL.revokeObjectURL(url);
      updateTab(activeTabId, {
        fileName: finalFilename,
        name: finalFilename,
        isModified: false
      });
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = getTextContent(activeTab.text);
      await navigator.clipboard.writeText(textToCopy);
      alert(t('notepad:messages.copiedToClipboard'));
      setShowShareModal(false);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = getTextContent(activeTab.text);
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
    const body = encodeURIComponent(getTextContent(activeTab.text));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  const handleDownloadShare = () => {
    const blob = new Blob([getTextContent(activeTab.text)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.fileName || `${activeTab.name}.txt`;
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
      const newText = activeTab.text.substring(0, start) + clipboardText + activeTab.text.substring(end);
      updateTab(activeTabId, { text: newText, isModified: true });
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  };

  const handleDelete = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const newText = activeTab.text.substring(0, start) + activeTab.text.substring(end);
      updateTab(activeTabId, { text: newText, isModified: true });
    }
  };

  const handleSelectAll = () => {
    textareaRef.current?.select();
  };

  // View operations
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

  // Text formatting operations
  const applyFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Save to history after formatting
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      updateTab(activeTabId, { text: newContent, isModified: true });
      setTimeout(() => saveToHistory(newContent), 0);
    }
  }, [activeTabId]);

  const handleBold = () => {
    applyFormat('bold');
  };

  const handleUnderline = () => {
    applyFormat('underline');
  };

  const handleTextColor = (color) => {
    setCurrentColor(color);
    applyFormat('foreColor', color);
    setShowColorPicker(false);
  };

  const handleHighlight = (color) => {
    applyFormat('hiliteColor', color);
  };

  // Handle editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      updateTab(activeTabId, { text: newContent, isModified: true });

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      if (!isComposing) {
        typingTimerRef.current = setTimeout(() => {
          saveToHistory(newContent);
        }, 1000);
      }
    }
  };

  // Handle editor paste - strip formatting if needed
  const handleEditorPaste = (e) => {
    // Allow formatted paste by default
    // If you want plain text only, uncomment below:
    // e.preventDefault();
    // const text = e.clipboardData.getData('text/plain');
    // document.execCommand('insertText', false, text);
  };

  // Handle editor key down
  const handleEditorKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
      }
    }
  };

  // Color presets
  const colorPresets = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
    '#9900ff', '#ff00ff', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
    '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];

  // Calculate stats - extract text content from HTML
  const getTextContent = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  const plainText = getTextContent(activeTab.text);
  const lines = plainText.split('\n').length;
  const chars = plainText.length;
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  
  // For cursor position in contentEditable
  const currentLine = 1;
  const currentColumn = 1;

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
          case 't':
            e.preventDefault();
            handleNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (tabs.length > 1) {
              handleCloseTab(activeTabId, e);
            }
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
  }, [activeTabId, activeTab, tabs]);

  // Cleanup
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
    setShowColorPicker(false);
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
            <span>{t('notepad:alert')}</span>
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
        <div style={{ marginLeft: 'auto' }}>
          <HeaderControls />
        </div>
      </div>

      {/* Tabs */}
      <div className="notepad-tabs">
        <div className="tabs-container">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="tab-name" title={tab.name}>
                {tab.isModified && '● '}{tab.name}
              </span>
              <button 
                className="tab-close"
                onClick={(e) => handleCloseTab(tab.id, e)}
                title={t('notepad:tabs.close') || '닫기'}
              >
                ×
              </button>
            </div>
          ))}
          <button 
            className="new-tab-btn" 
            onClick={handleNewTab}
            title={t('notepad:tabs.newTab') || '새 탭'}
          >
            +
          </button>
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
              <div className="menu-option" onClick={handleNewWindow}>{t('notepad:fileMenu.newWindow') || '새 창'}</div>
              <div className="menu-option" onClick={handleNewTab}>{t('notepad:fileMenu.newTab') || '새 탭'}</div>
              <div className="menu-option" onClick={handleOpen}>{t('notepad:fileMenu.open')}</div>
              <div className="menu-divider"></div>
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
              <div className="menu-option" onClick={handleUndo} style={{ opacity: activeTab.historyIndex <= 0 ? 0.5 : 1 }}>
                {t('notepad:editMenu.undo')}
              </div>
              <div className="menu-option" onClick={handleRedo} style={{ opacity: activeTab.historyIndex >= activeTab.history.length - 1 ? 0.5 : 1 }}>
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
              <div className="menu-option" onClick={handleToggleDarkMode}>
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
        <button onClick={handleNewWindow} title={t('notepad:toolbar.newWindow') || '새 창'} className="toolbar-btn">🪟</button>
        <button onClick={handleOpen} title={t('notepad:toolbar.open')} className="toolbar-btn">📂</button>
        <button onClick={handleSave} title={t('notepad:toolbar.save')} className="toolbar-btn">💾</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleCut} title={t('notepad:toolbar.cut')} className="toolbar-btn">✂️</button>
        <button onClick={handleCopy} title={t('notepad:toolbar.copy')} className="toolbar-btn">📑</button>
        <button onClick={handlePaste} title={t('notepad:toolbar.paste')} className="toolbar-btn">📋</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleUndo} title={t('notepad:toolbar.undo')} className="toolbar-btn" disabled={activeTab.historyIndex <= 0}>↶</button>
        <button onClick={handleRedo} title={t('notepad:toolbar.redo')} className="toolbar-btn" disabled={activeTab.historyIndex >= activeTab.history.length - 1}>↷</button>
        <div className="toolbar-divider"></div>
        <button onClick={handleZoomIn} title={t('notepad:toolbar.zoomIn')} className="toolbar-btn">🔍+</button>
        <button onClick={handleZoomOut} title={t('notepad:toolbar.zoomOut')} className="toolbar-btn">🔍−</button>
        <div className="toolbar-divider"></div>
        <div className="toolbar-btn-relative">
          <button
            ref={fontSizeButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowFontSizeMenu(!showFontSizeMenu);
            }}
            title={t('notepad:toolbar.fontSize')}
            className="toolbar-btn font-size-btn"
          >
            <span className="font-size-value">{fontSize}</span>
            <span className="font-size-unit">pt</span>
          </button>
          {showFontSizeMenu && (
            <div className="font-size-dropdown">
              <div className="font-size-option" onClick={() => handleFontSizeChange(10)}>10 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(12)}>12 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(14)}>14 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(16)}>16 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(18)}>18 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(20)}>20 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(24)}>24 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(28)}>28 pt</div>
              <div className="font-size-option" onClick={() => handleFontSizeChange(32)}>32 pt</div>
            </div>
          )}
        </div>
        <div className="toolbar-divider"></div>
        <button onClick={handleBold} title={t('notepad:toolbar.bold') || '굵게 (Ctrl+B)'} className="toolbar-btn toolbar-format-btn">B</button>
        <button onClick={handleUnderline} title={t('notepad:toolbar.underline') || '밑줄 (Ctrl+U)'} className="toolbar-btn toolbar-format-btn underline-btn">U</button>
        <div className="toolbar-btn-relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title={t('notepad:toolbar.textColor') || '글자 색상'}
            className="toolbar-btn color-btn"
          >
            <span className="color-btn-text">A</span>
            <span className="color-indicator" style={{ backgroundColor: currentColor }}></span>
          </button>
          {showColorPicker && (
            <div className="color-picker-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="color-picker-title">{t('notepad:toolbar.textColor') || '글자 색상'}</div>
              <div className="color-presets">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    className="color-preset-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => handleTextColor(color)}
                    title={color}
                  />
                ))}
              </div>
              <div className="custom-color-section">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleTextColor(e.target.value)}
                  className="custom-color-input"
                />
                <span className="custom-color-label">{t('notepad:toolbar.customColor') || '사용자 지정 색상'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="toolbar-divider"></div>
        <button onClick={() => alert(t('notepad:helpMenu.aboutText'))} title={t('notepad:toolbar.help')} className="toolbar-btn">❓</button>
      </div>

      {/* Rich Text Editor Container with Zoom */}
      <div style={{ flex: 1, overflow: 'auto', transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100/zoomLevel}%`, height: `${100/zoomLevel}%` }}>
        <div
          ref={editorRef}
          className="notepad-editor"
          contentEditable={true}
          onInput={handleEditorInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleEditorKeyDown}
          onPaste={handleEditorPaste}
          style={{ fontSize: `${fontSize}px`, minHeight: '100%' }}
          dangerouslySetInnerHTML={{ __html: activeTab.text || '' }}
          data-placeholder={t('notepad:placeholder')}
          suppressContentEditableWarning={true}
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
                    onChange={handleToggleDarkMode}
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
