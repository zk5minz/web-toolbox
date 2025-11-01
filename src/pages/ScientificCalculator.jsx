import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as math from 'mathjs';
import HeaderControls from '../components/HeaderControls';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './ScientificCalculator.css';

function ScientificCalculator() {
  const { t, i18n } = useTranslation(['scientificCalculator', 'translation']);
  
  // Set canonical URL
  useCanonicalUrl('/scientific-calculator');
  const [activeTab, setActiveTab] = useState('basic');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('0');
  const [lastResult, setLastResult] = useState('0');
  const [angleMode, setAngleMode] = useState('DEG');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.title = t('scientificCalculator:metaTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('scientificCalculator:metaDescription'));
    }
    
    const savedHistory = localStorage.getItem('calcHistory');
    const savedAngleMode = localStorage.getItem('calcAngleMode');
    const savedLastResult = localStorage.getItem('lastResult');

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedAngleMode) setAngleMode(savedAngleMode);
    if (savedLastResult) setLastResult(savedLastResult);
  }, [t]);

  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calcAngleMode', angleMode);
  }, [angleMode]);

  useEffect(() => {
    console.log('🔄 lastResult 변경됨:', lastResult);
  }, [lastResult]);

  const calculate = () => {
    try {
      let expression = input.trim();

      if (!expression) {
        setResult('0');
        return;
      }

      console.log('');
      console.log('🔵 ===== 계산 시작 =====');
      console.log('📝 입력:', input);

      expression = expression.replace(/\bans\b/gi, lastResult || '0');
      console.log('✏️ ans 치환 후:', expression);

      const hasInverseTrig = /asin|acos|atan/i.test(expression);

      expression = expression
        .replace(/(\d+)x(?![a-z])/gi, '$1*x')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\*/g, '*')
        .replace(/−/g, '-')
        .replace(/\^/g, '^')
        .replace(/π/g, 'pi')
        .replace(/stdp\((\[[^\]]+\])\)/g, "std($1, 'uncorrected')")
        .replace(/ln\(/g, '__NATURALLOG__(')
        .replace(/log\(/g, 'log10(')
        .replace(/__NATURALLOG__\(/g, 'log(')
        .replace(/√\(/g, 'sqrt(')
        .replace(/√/g, 'sqrt')
        .replace(/ⁿ√/g, 'nthRoot')
        .replace(/\|([^|]+)\|/g, 'abs($1)')
        .replace(/(\d+)!/g, 'factorial($1)');

      console.log('Converted expression:', expression);

      if (angleMode === 'DEG' && !hasInverseTrig) {
        expression = expression.replace(/sin\(([^)]+)\)/g, (match, angle) => {
          return `sin((${angle}) * pi / 180)`;
        });
        expression = expression.replace(/cos\(([^)]+)\)/g, (match, angle) => {
          return `cos((${angle}) * pi / 180)`;
        });
        expression = expression.replace(/tan\(([^)]+)\)/g, (match, angle) => {
          return `tan((${angle}) * pi / 180)`;
        });
        console.log('DEG mode - converted expression:', expression);
      }

      if (expression.includes('=')) {
        const parts = expression.split('=');
        if (parts.length === 2) {
          const leftSide = parts[0].trim();
          const rightSide = parts[1].trim();

          const variables = expression.match(/[a-z]/gi);
          if (variables && variables.length > 0) {
            const mathConstants = ['e', 'pi', 'i'];
            const realVariables = variables.filter(v => !mathConstants.includes(v.toLowerCase()));

            if (realVariables.length > 0) {
              const variable = realVariables[0];
              try {
                const solution = math.solve(`${leftSide} - (${rightSide})`, variable);
                console.log('Equation solution:', solution);
                const resultStr = `${variable} = ${formatResult(solution)}`;
                setResult(resultStr);
                addToHistory(input, resultStr);
                return;
              } catch (e) {
                console.error('Equation solving error:', e);
                try {
                  const left = math.evaluate(leftSide);
                  const right = math.evaluate(rightSide);
                  console.log('Equation evaluation:', left, '=', right);
                  const resultStr = `${formatResult(left)} = ${formatResult(right)}`;
                  setResult(resultStr);
                  addToHistory(input, resultStr);
                  return;
                } catch (err) {
                  throw err;
                }
              }
            }
          }
        }
      }

      let calcResult = math.evaluate(expression);

      console.log('Result (before conversion):', calcResult);

      if (angleMode === 'DEG' && hasInverseTrig) {
        calcResult = calcResult * 180 / Math.PI;
        console.log('Result (after DEG conversion):', calcResult);
      }

      console.log('');
      console.log('🎯 계산 결과:', calcResult);

      const resultStr = formatResult(calcResult);
      console.log('📤 resultString:', resultStr);

      setResult(resultStr);
      setLastResult(resultStr);
      localStorage.setItem('lastResult', resultStr);
      console.log('💾 localStorage 저장 완료');
      console.log('🔵 ===== 계산 완료 =====');
      console.log('');

      addToHistory(input, resultStr);

    } catch (error) {
      console.error('❌ 계산 에러:', error);
      setResult('Error: ' + error.message);
    }
  };

  const addToHistory = (expr, res) => {
    const historyItem = {
      expression: expr,
      result: res,
      timestamp: Date.now()
    };

    const newHistory = [historyItem, ...history].slice(0, 30);
    setHistory(newHistory);
  };

  const formatResult = (value) => {
    if (typeof value === 'number') {
      if (!isFinite(value)) return 'Error';
      if (Math.abs(value) < 1e-10 && value !== 0) return value.toExponential(6);
      if (Math.abs(value) > 1e10) return value.toExponential(6);

      const rounded = Math.round(value * 1e10) / 1e10;
      return rounded.toString();
    }

    if (Array.isArray(value)) {
      return value.map(v => formatResult(v)).join(', ');
    }

    return String(value);
  };

  const handleButtonClick = (value) => {
    setInput(prev => prev + value);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  const handleAllClear = () => {
    setInput('');
    setResult('0');
    setLastResult('0');
    localStorage.setItem('lastResult', '0');
  };

  const handleClearHistory = () => {
    if (confirm(t('scientificCalculator:messages.clearConfirm'))) {
      setHistory([]);
    }
  };

  const loadHistoryItem = (item) => {
    setInput(item.expression);
    setResult(item.result);
  };

  const toggleAngleMode = () => {
    setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    let cleaned = pastedText
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
    setInput(prev => prev + cleaned);
  };

  return (
    <div className="scientific-calculator-container">
      <header className="calculator-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="breadcrumb" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link
                to="/"
                className="breadcrumb-home-link"
                style={{
                  background: 'white',
                  color: '#6366f1',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1e40af';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#6366f1';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                🏠 {t('translation:nav.home')}
              </Link>
              <span> &gt; </span>
              <span>{t('translation:nav.tools')}</span>
              <span> &gt; </span>
              <span>{t('scientificCalculator:header.title')}</span>
            </div>
            <h1>
              <img
                src="/calculator-icon.png"
                alt="Calculator"
                style={{
                  width: '64px',
                  height: '64px',
                  verticalAlign: 'middle',
                  marginRight: '16px'
                }}
              />
              {t('scientificCalculator:header.title')}
            </h1>
            <p>{t('scientificCalculator:header.subtitle')}</p>
          </div>
          <div style={{ position: 'absolute', top: '16px', right: '20px' }}>
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="calculator-content">
        <div className="calculator-main">
          <div className="calculator-body">
            <div className="angle-mode-toggle">
              <button
                onClick={toggleAngleMode}
                className={`angle-btn ${angleMode === 'DEG' ? 'active' : ''}`}
              >
                {t('scientificCalculator:angleMode.deg')}
              </button>
              <button
                onClick={toggleAngleMode}
                className={`angle-btn ${angleMode === 'RAD' ? 'active' : ''}`}
              >
                {t('scientificCalculator:angleMode.rad')}
              </button>
            </div>

            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                {t('scientificCalculator:tabs.basic')}
              </button>
              <button
                className={`tab-btn ${activeTab === 'functions' ? 'active' : ''}`}
                onClick={() => setActiveTab('functions')}
              >
                {t('scientificCalculator:tabs.functions')}
              </button>
              <button
                className={`tab-btn ${activeTab === 'variables' ? 'active' : ''}`}
                onClick={() => setActiveTab('variables')}
              >
                {t('scientificCalculator:tabs.variables')}
              </button>
            </div>

            <div className="calculator-display">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    calculate();
                  }
                  else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleAllClear();
                  }
                }}
                placeholder={t('scientificCalculator:display.placeholder')}
                className="input-display"
              />
              <div className="result-display">
                {result && `= ${result}`}
              </div>
            </div>

            {activeTab === 'basic' && (
              <div className="basic-layout">
                <div className="left-functions">
                  <button onClick={handleClear} className="btn btn-clear">{t('scientificCalculator:buttons.clear')}</button>
                  <button onClick={handleAllClear} className="btn btn-clear">{t('scientificCalculator:buttons.allClear')}</button>
                  <button onClick={() => handleButtonClick('^2')} className="btn btn-function">{t('scientificCalculator:buttons.squared')}</button>
                  <button onClick={() => handleButtonClick('^')} className="btn btn-function">{t('scientificCalculator:buttons.power')}</button>

                  <button onClick={() => handleButtonClick('sqrt(')} className="btn btn-function">{t('scientificCalculator:buttons.sqrt')}</button>
                  <button onClick={() => handleButtonClick('nthRoot(')} className="btn btn-function">{t('scientificCalculator:buttons.nthRoot')}</button>
                  <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">{t('scientificCalculator:buttons.pi')}</button>
                  <button onClick={() => handleButtonClick('abs(')} className="btn btn-function">{t('scientificCalculator:buttons.abs')}</button>

                  <button onClick={() => handleButtonClick('sin(')} className="btn btn-function">{t('scientificCalculator:buttons.sin')}</button>
                  <button onClick={() => handleButtonClick('cos(')} className="btn btn-function">{t('scientificCalculator:buttons.cos')}</button>
                  <button onClick={() => handleButtonClick('tan(')} className="btn btn-function">{t('scientificCalculator:buttons.tan')}</button>
                  <button className="btn btn-empty"></button>

                  <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.leftParen')}</button>
                  <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.rightParen')}</button>
                  <button onClick={() => handleButtonClick(',')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.comma')}</button>
                  <button className="btn btn-empty"></button>
                </div>

                <div className="right-numpad">
                  <button onClick={() => handleButtonClick('7')} className="btn btn-number">7</button>
                  <button onClick={() => handleButtonClick('8')} className="btn btn-number">8</button>
                  <button onClick={() => handleButtonClick('9')} className="btn btn-number">9</button>
                  <button onClick={() => handleButtonClick('/')} className="btn btn-operator">{t('scientificCalculator:buttons.divide')}</button>

                  <button onClick={() => handleButtonClick('4')} className="btn btn-number">4</button>
                  <button onClick={() => handleButtonClick('5')} className="btn btn-number">5</button>
                  <button onClick={() => handleButtonClick('6')} className="btn btn-number">6</button>
                  <button onClick={() => handleButtonClick('*')} className="btn btn-operator">{t('scientificCalculator:buttons.multiply')}</button>

                  <button onClick={() => handleButtonClick('1')} className="btn btn-number">1</button>
                  <button onClick={() => handleButtonClick('2')} className="btn btn-number">2</button>
                  <button onClick={() => handleButtonClick('3')} className="btn btn-number">3</button>
                  <button onClick={() => handleButtonClick('-')} className="btn btn-operator">{t('scientificCalculator:buttons.minus')}</button>

                  <button onClick={() => handleButtonClick('0')} className="btn btn-number">0</button>
                  <button onClick={() => handleButtonClick('.')} className="btn btn-number">.</button>
                  <button onClick={handleDelete} className="btn btn-delete">{t('scientificCalculator:buttons.delete')}</button>
                  <button onClick={() => handleButtonClick('+')} className="btn btn-operator">{t('scientificCalculator:buttons.plus')}</button>

                  <button onClick={() => handleButtonClick('ans')} className="btn btn-constant">{t('scientificCalculator:buttons.ans')}</button>
                  <button onClick={() => handleButtonClick('%')} className="btn btn-operator">{t('scientificCalculator:buttons.modulo')}</button>
                  <button onClick={() => handleButtonClick('/')} className="btn btn-operator">{t('scientificCalculator:buttons.fraction')}</button>
                  <button onClick={calculate} className="btn btn-equals">{t('scientificCalculator:buttons.equals')}</button>
                </div>
              </div>
            )}

            {activeTab === 'functions' && (
              <div className="functions-grid">
                <button onClick={handleClear} className="btn btn-clear">{t('scientificCalculator:buttons.clear')}</button>
                <button onClick={handleAllClear} className="btn btn-clear">{t('scientificCalculator:buttons.allClear')}</button>
                <button onClick={handleDelete} className="btn btn-delete">{t('scientificCalculator:buttons.delete')}</button>
                <button onClick={() => handleButtonClick('^')} className="btn btn-function">{t('scientificCalculator:buttons.power')}</button>
                <button onClick={() => handleButtonClick('sqrt(')} className="btn btn-function">{t('scientificCalculator:buttons.sqrt')}</button>
                <button onClick={() => handleButtonClick('nthRoot(')} className="btn btn-function">{t('scientificCalculator:buttons.nthRoot')}</button>

                <button onClick={() => handleButtonClick('sin(')} className="btn btn-function">{t('scientificCalculator:buttons.sin')}</button>
                <button onClick={() => handleButtonClick('cos(')} className="btn btn-function">{t('scientificCalculator:buttons.cos')}</button>
                <button onClick={() => handleButtonClick('tan(')} className="btn btn-function">{t('scientificCalculator:buttons.tan')}</button>
                <button onClick={() => handleButtonClick('asin(')} className="btn btn-function">{t('scientificCalculator:buttons.asin')}</button>
                <button onClick={() => handleButtonClick('acos(')} className="btn btn-function">{t('scientificCalculator:buttons.acos')}</button>
                <button onClick={() => handleButtonClick('atan(')} className="btn btn-function">{t('scientificCalculator:buttons.atan')}</button>

                <button onClick={() => handleButtonClick('exp(')} className="btn btn-function">{t('scientificCalculator:buttons.exp')}</button>
                <button onClick={() => handleButtonClick('abs(')} className="btn btn-function">{t('scientificCalculator:buttons.abs')}</button>
                <button onClick={() => handleButtonClick('round(')} className="btn btn-function">{t('scientificCalculator:buttons.round')}</button>
                <button onClick={() => handleButtonClick('mean(')} className="btn btn-function">{t('scientificCalculator:buttons.mean')}</button>
                <button onClick={() => handleButtonClick('std(')} className="btn btn-function">{t('scientificCalculator:buttons.std')}</button>
                <button onClick={() => handleButtonClick('stdp(')} className="btn btn-function">{t('scientificCalculator:buttons.stdp')}</button>

                <button onClick={() => handleButtonClick('log(')} className="btn btn-function">{t('scientificCalculator:buttons.ln')}</button>
                <button onClick={() => handleButtonClick('log10(')} className="btn btn-function">{t('scientificCalculator:buttons.log')}</button>
                <button onClick={() => handleButtonClick('permutations(')} className="btn btn-function">{t('scientificCalculator:buttons.nPr')}</button>
                <button onClick={() => handleButtonClick('combinations(')} className="btn btn-function">{t('scientificCalculator:buttons.nCr')}</button>
                <button onClick={() => handleButtonClick('!')} className="btn btn-function">{t('scientificCalculator:buttons.factorial')}</button>
                <button onClick={calculate} className="btn btn-equals">{t('scientificCalculator:buttons.equals')}</button>

                <button onClick={() => handleButtonClick('e')} className="btn btn-constant">{t('scientificCalculator:buttons.e')}</button>
                <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">{t('scientificCalculator:buttons.pi')}</button>
                <button onClick={() => handleButtonClick('ans')} className="btn btn-constant">{t('scientificCalculator:buttons.ans')}</button>
                <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.leftParen')}</button>
                <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.rightParen')}</button>
                <button onClick={() => handleButtonClick(',')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.comma')}</button>
              </div>
            )}

            {activeTab === 'variables' && (
              <div className="variables-grid">
                <button onClick={() => handleButtonClick('q')} className="btn btn-var">q</button>
                <button onClick={() => handleButtonClick('w')} className="btn btn-var">w</button>
                <button onClick={() => handleButtonClick('e')} className="btn btn-var">e</button>
                <button onClick={() => handleButtonClick('r')} className="btn btn-var">r</button>
                <button onClick={() => handleButtonClick('t')} className="btn btn-var">t</button>
                <button onClick={() => handleButtonClick('y')} className="btn btn-var">y</button>
                <button onClick={() => handleButtonClick('u')} className="btn btn-var">u</button>
                <button onClick={() => handleButtonClick('i')} className="btn btn-var">i</button>
                <button onClick={() => handleButtonClick('o')} className="btn btn-var">o</button>
                <button onClick={() => handleButtonClick('p')} className="btn btn-var">p</button>

                <button onClick={() => handleButtonClick('a')} className="btn btn-var">a</button>
                <button onClick={() => handleButtonClick('s')} className="btn btn-var">s</button>
                <button onClick={() => handleButtonClick('d')} className="btn btn-var">d</button>
                <button onClick={() => handleButtonClick('f')} className="btn btn-var">f</button>
                <button onClick={() => handleButtonClick('g')} className="btn btn-var">g</button>
                <button onClick={() => handleButtonClick('h')} className="btn btn-var">h</button>
                <button onClick={() => handleButtonClick('j')} className="btn btn-var">j</button>
                <button onClick={() => handleButtonClick('k')} className="btn btn-var">k</button>
                <button onClick={() => handleButtonClick('l')} className="btn btn-var">l</button>
                <button onClick={handleDelete} className="btn btn-delete">{t('scientificCalculator:buttons.delete')}</button>

                <button onClick={() => handleButtonClick('=')} className="btn btn-var">=</button>
                <button onClick={() => handleButtonClick('/')} className="btn btn-operator">{t('scientificCalculator:buttons.divide')}</button>
                <button onClick={() => handleButtonClick('x')} className="btn btn-var">x</button>
                <button onClick={() => handleButtonClick('c')} className="btn btn-var">c</button>
                <button onClick={() => handleButtonClick('v')} className="btn btn-var">v</button>
                <button onClick={() => handleButtonClick('b')} className="btn btn-var">b</button>
                <button onClick={() => handleButtonClick('n')} className="btn btn-var">n</button>
                <button onClick={() => handleButtonClick('m')} className="btn btn-var">m</button>
                <button onClick={() => handleButtonClick(',')} className="btn btn-var">{t('scientificCalculator:buttons.comma')}</button>
                <button onClick={handleClear} className="btn btn-clear">{t('scientificCalculator:buttons.clear')}</button>

                <button onClick={() => handleButtonClick('^')} className="btn btn-function">↑</button>
                <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.leftParen')}</button>
                <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">{t('scientificCalculator:buttons.rightParen')}</button>
                <button onClick={() => handleButtonClick('[')} className="btn btn-var">[</button>
                <button onClick={() => handleButtonClick(']')} className="btn btn-var">]</button>
                <button onClick={() => handleButtonClick('!')} className="btn btn-var">{t('scientificCalculator:buttons.factorial')}</button>
                <button onClick={() => handleButtonClick("'")} className="btn btn-var">'</button>
                <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">{t('scientificCalculator:buttons.pi')}</button>
                <button onClick={() => handleButtonClick('+')} className="btn btn-operator">{t('scientificCalculator:buttons.plus')}</button>
                <button onClick={calculate} className="btn btn-equals">{t('scientificCalculator:buttons.equals')}</button>
              </div>
            )}
          </div>
        </div>

        <div className="history-panel">
          <div className="history-header">
            <h3>{t('scientificCalculator:history.title')}</h3>
            <button onClick={handleClearHistory} className="clear-history-btn">
              {t('scientificCalculator:history.clearHistory')}
            </button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">{t('scientificCalculator:history.empty')}</div>
            ) : (
              history.map((item, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>{t('scientificCalculator:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('scientificCalculator:features.privateSecure.title')}</h3>
            <p>{t('scientificCalculator:features.privateSecure.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('scientificCalculator:features.advancedFunctions.title')}</h3>
            <p>{t('scientificCalculator:features.advancedFunctions.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>{t('scientificCalculator:features.calculationHistory.title')}</h3>
            <p>{t('scientificCalculator:features.calculationHistory.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>{t('scientificCalculator:features.highPrecision.title')}</h3>
            <p>{t('scientificCalculator:features.highPrecision.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⌨️</div>
            <h3>{t('scientificCalculator:features.keyboardSupport.title')}</h3>
            <p>{t('scientificCalculator:features.keyboardSupport.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('scientificCalculator:features.free.title')}</h3>
            <p>{t('scientificCalculator:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScientificCalculator;
