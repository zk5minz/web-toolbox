import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import './ScientificCalculator.css';

function ScientificCalculator() {
  const [activeTab, setActiveTab] = useState('basic');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('0');
  const [lastResult, setLastResult] = useState('0');
  const [angleMode, setAngleMode] = useState('DEG');
  const [history, setHistory] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('calcHistory');
    const savedAngleMode = localStorage.getItem('calcAngleMode');
    const savedLastResult = localStorage.getItem('lastResult');

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedAngleMode) setAngleMode(savedAngleMode);
    if (savedLastResult) setLastResult(savedLastResult);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calcAngleMode', angleMode);
  }, [angleMode]);

  // Track lastResult changes for debugging
  useEffect(() => {
    console.log('🔄 lastResult 변경됨:', lastResult);
  }, [lastResult]);

  // Calculate function with proper symbol conversion
  const calculate = () => {
    try {
      let expression = input.trim();

      if (!expression) {
        setResult('0');
        return;
      }

      // ========== 디버깅 시작 ==========
      console.log('');
      console.log('🔵 ===== 계산 시작 =====');
      console.log('📝 입력:', input);
      console.log('🔢 현재 lastResult:', lastResult);
      console.log('🔢 lastResult 타입:', typeof lastResult);
      console.log('');

      // Convert ans to lastResult (FIRST!)
      expression = expression.replace(/\bans\b/gi, lastResult || '0');
      console.log('✏️ ans 치환 후:', expression);

      // Check if input contains inverse trig functions
      const hasInverseTrig = /asin|acos|atan/i.test(expression);

      // 1. Convert all special symbols to standard format
      // IMPORTANT: Process in this order to avoid conflicts
      expression = expression
        // Convert 2x → 2*x (but protect function names like exp, max)
        .replace(/(\d+)x(?![a-z])/gi, '$1*x')  // Only convert x after numbers if not followed by letters
        // Convert operators first
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\*/g, '*')  // Standardize multiplication
        .replace(/−/g, '-')   // Standardize minus
        .replace(/\^/g, '^')
        // Convert constants - keep as math.js constants
        .replace(/π/g, 'pi')  // math.js uses 'pi'
        // Note: 'e' is already recognized by math.js, no conversion needed
        // Convert stdp (population std) to std with 'uncorrected' parameter
        .replace(/stdp\((\[[^\]]+\])\)/g, "std($1, 'uncorrected')")  // stdp([data]) → std([data], 'uncorrected')
        // Convert log functions with markers to avoid conflicts
        .replace(/ln\(/g, '__NATURALLOG__(')   // ln → temporary marker
        .replace(/log\(/g, 'log10(')           // log → log10 (common log)
        .replace(/__NATURALLOG__\(/g, 'log(')  // marker → log (natural log in math.js)
        // Convert other functions
        .replace(/√\(/g, 'sqrt(')
        .replace(/√/g, 'sqrt')
        .replace(/ⁿ√/g, 'nthRoot')
        .replace(/\|([^|]+)\|/g, 'abs($1)')
        .replace(/(\d+)!/g, 'factorial($1)');

      console.log('Converted expression:', expression);

      // 2. Handle angle mode for trigonometric functions
      if (angleMode === 'DEG' && !hasInverseTrig) {
        // Convert degrees to radians for forward trig functions (sin, cos, tan)
        // Only if there are no inverse trig functions
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

      // 3. Check if it's an equation (contains =)
      if (expression.includes('=')) {
        const parts = expression.split('=');
        if (parts.length === 2) {
          const leftSide = parts[0].trim();
          const rightSide = parts[1].trim();

          // Find variables in the equation
          const variables = expression.match(/[a-z]/gi);
          if (variables && variables.length > 0) {
            // Filter out math constants
            const mathConstants = ['e', 'pi', 'i'];
            const realVariables = variables.filter(v => !mathConstants.includes(v.toLowerCase()));

            if (realVariables.length > 0) {
              const variable = realVariables[0];
              try {
                // Try to solve the equation
                const solution = math.solve(`${leftSide} - (${rightSide})`, variable);
                console.log('Equation solution:', solution);
                const resultStr = `${variable} = ${formatResult(solution)}`;
                setResult(resultStr);

                // Add to history
                addToHistory(input, resultStr);
                return;
              } catch (e) {
                console.error('Equation solving error:', e);
                // If can't solve, evaluate both sides
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

      // 4. Calculate normal expression
      let calcResult = math.evaluate(expression);

      console.log('Result (before conversion):', calcResult);

      // 5. Convert inverse trig result from radians to degrees if needed
      if (angleMode === 'DEG' && hasInverseTrig) {
        // Convert result from radians to degrees
        calcResult = calcResult * 180 / Math.PI;
        console.log('Result (after DEG conversion):', calcResult);
      }

      // 6. Display result
      console.log('');
      console.log('🎯 계산 결과:', calcResult);
      console.log('🎯 결과 타입:', typeof calcResult);

      const resultStr = formatResult(calcResult);
      console.log('📤 resultString:', resultStr);

      console.log('💾 setResult 호출...');
      setResult(resultStr);

      console.log('💾 setLastResult 호출 전 - lastResult:', lastResult);
      setLastResult(resultStr);
      console.log('💾 setLastResult 호출 후 - 저장할 값:', resultStr);

      // Save lastResult to localStorage
      localStorage.setItem('lastResult', resultStr);
      console.log('💾 localStorage 저장 완료');

      console.log('🔵 ===== 계산 완료 =====');
      console.log('');
      // ========== 디버깅 끝 ==========

      // 7. Add to history
      addToHistory(input, resultStr);

    } catch (error) {
      console.error('❌ 계산 에러:', error);
      console.error('❌ 에러 메시지:', error.message);
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
    console.log('🧹 C (Clear) 호출 - input만 클리어');
    setInput('');
    // lastResult는 유지됨
  };

  const handleAllClear = () => {
    console.log('🧹🧹 AC (All Clear) 호출 - 전체 클리어');
    setInput('');
    setResult('0');
    setLastResult('0');  // AC clears ans as well
    localStorage.setItem('lastResult', '0');
    console.log('💾 lastResult 초기화됨: 0');
  };

  const handleAns = () => {
    if (result && result !== '0') {
      setInput(prev => prev + result);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear all calculation history?')) {
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
    console.log('Pasted text:', pastedText);

    // Clean and convert special characters
    let cleaned = pastedText
      .replace(/\s+/g, '')  // Remove spaces
      .replace(/×/g, '*')
      .replace(/÷/g, '/');
      // Note: Don't convert 'x' here - let calculate() handle it smartly

    setInput(prev => prev + cleaned);
  };

  return (
    <div className="scientific-calculator-container">
      <header className="calculator-header">
        <div className="breadcrumb">
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
            🏠 Home
          </Link>
          <span> &gt; </span>
          <span>Tools</span>
          <span> &gt; </span>
          <span>Scientific Calculator</span>
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
          Scientific Calculator
        </h1>
        <p>Advanced calculator with equation solving</p>
      </header>

      <div className="calculator-content">
        <div className="calculator-main">
          <div className="calculator-body">
            {/* Angle Mode Toggle */}
            <div className="angle-mode-toggle">
              <button
                onClick={toggleAngleMode}
                className={`angle-btn ${angleMode === 'DEG' ? 'active' : ''}`}
              >
                DEG
              </button>
              <button
                onClick={toggleAngleMode}
                className={`angle-btn ${angleMode === 'RAD' ? 'active' : ''}`}
              >
                RAD
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic
              </button>
              <button
                className={`tab-btn ${activeTab === 'functions' ? 'active' : ''}`}
                onClick={() => setActiveTab('functions')}
              >
                Functions
              </button>
              <button
                className={`tab-btn ${activeTab === 'variables' ? 'active' : ''}`}
                onClick={() => setActiveTab('variables')}
              >
                Variables
              </button>
            </div>

            {/* Display */}
            <div className="calculator-display">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  // Enter key to calculate
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    calculate();
                  }
                  // Escape key to clear all
                  else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleAllClear();
                  }
                  // Don't handle other keys here - let onChange handle them
                }}
                placeholder="Enter expression"
                className="input-display"
              />
              <div className="result-display">
                {result && `= ${result}`}
              </div>
            </div>

            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="basic-layout">
                <div className="left-functions">
                  <button onClick={handleClear} className="btn btn-clear">C</button>
                  <button onClick={handleAllClear} className="btn btn-clear">AC</button>
                  <button onClick={() => handleButtonClick('^2')} className="btn btn-function">a²</button>
                  <button onClick={() => handleButtonClick('^')} className="btn btn-function">aᵇ</button>

                  <button onClick={() => handleButtonClick('sqrt(')} className="btn btn-function">√</button>
                  <button onClick={() => handleButtonClick('nthRoot(')} className="btn btn-function">ⁿ√</button>
                  <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">π</button>
                  <button onClick={() => handleButtonClick('abs(')} className="btn btn-function">|a|</button>

                  <button onClick={() => handleButtonClick('sin(')} className="btn btn-function">sin</button>
                  <button onClick={() => handleButtonClick('cos(')} className="btn btn-function">cos</button>
                  <button onClick={() => handleButtonClick('tan(')} className="btn btn-function">tan</button>
                  <button className="btn btn-empty"></button>

                  <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">(</button>
                  <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">)</button>
                  <button onClick={() => handleButtonClick(',')} className="btn btn-parenthesis">,</button>
                  <button className="btn btn-empty"></button>
                </div>

                <div className="right-numpad">
                  <button onClick={() => handleButtonClick('7')} className="btn btn-number">7</button>
                  <button onClick={() => handleButtonClick('8')} className="btn btn-number">8</button>
                  <button onClick={() => handleButtonClick('9')} className="btn btn-number">9</button>
                  <button onClick={() => handleButtonClick('/')} className="btn btn-operator">÷</button>

                  <button onClick={() => handleButtonClick('4')} className="btn btn-number">4</button>
                  <button onClick={() => handleButtonClick('5')} className="btn btn-number">5</button>
                  <button onClick={() => handleButtonClick('6')} className="btn btn-number">6</button>
                  <button onClick={() => handleButtonClick('*')} className="btn btn-operator">×</button>

                  <button onClick={() => handleButtonClick('1')} className="btn btn-number">1</button>
                  <button onClick={() => handleButtonClick('2')} className="btn btn-number">2</button>
                  <button onClick={() => handleButtonClick('3')} className="btn btn-number">3</button>
                  <button onClick={() => handleButtonClick('-')} className="btn btn-operator">-</button>

                  <button onClick={() => handleButtonClick('0')} className="btn btn-number">0</button>
                  <button onClick={() => handleButtonClick('.')} className="btn btn-number">.</button>
                  <button onClick={handleDelete} className="btn btn-delete">⌫</button>
                  <button onClick={() => handleButtonClick('+')} className="btn btn-operator">+</button>

                  <button onClick={() => handleButtonClick('ans')} className="btn btn-constant">ans</button>
                  <button onClick={() => handleButtonClick('%')} className="btn btn-operator">%</button>
                  <button onClick={() => handleButtonClick('/')} className="btn btn-operator">a/b</button>
                  <button onClick={calculate} className="btn btn-equals">=</button>
                </div>
              </div>
            )}

            {/* Functions Tab */}
            {activeTab === 'functions' && (
              <div className="functions-grid">
                <button onClick={handleClear} className="btn btn-clear">C</button>
                <button onClick={handleAllClear} className="btn btn-clear">AC</button>
                <button onClick={handleDelete} className="btn btn-delete">⌫</button>
                <button onClick={() => handleButtonClick('^')} className="btn btn-function">aᵇ</button>
                <button onClick={() => handleButtonClick('sqrt(')} className="btn btn-function">√</button>
                <button onClick={() => handleButtonClick('nthRoot(')} className="btn btn-function">ⁿ√</button>

                <button onClick={() => handleButtonClick('sin(')} className="btn btn-function">sin</button>
                <button onClick={() => handleButtonClick('cos(')} className="btn btn-function">cos</button>
                <button onClick={() => handleButtonClick('tan(')} className="btn btn-function">tan</button>
                <button onClick={() => handleButtonClick('asin(')} className="btn btn-function">sin⁻¹</button>
                <button onClick={() => handleButtonClick('acos(')} className="btn btn-function">cos⁻¹</button>
                <button onClick={() => handleButtonClick('atan(')} className="btn btn-function">tan⁻¹</button>

                <button onClick={() => handleButtonClick('exp(')} className="btn btn-function">eˣ</button>
                <button onClick={() => handleButtonClick('abs(')} className="btn btn-function">abs</button>
                <button onClick={() => handleButtonClick('round(')} className="btn btn-function">round</button>
                <button onClick={() => handleButtonClick('mean(')} className="btn btn-function">mean</button>
                <button onClick={() => handleButtonClick('std(')} className="btn btn-function">stdev</button>
                <button onClick={() => handleButtonClick('stdp(')} className="btn btn-function">stdevp</button>

                <button onClick={() => handleButtonClick('log(')} className="btn btn-function">ln</button>
                <button onClick={() => handleButtonClick('log10(')} className="btn btn-function">log</button>
                <button onClick={() => handleButtonClick('permutations(')} className="btn btn-function">nPr</button>
                <button onClick={() => handleButtonClick('combinations(')} className="btn btn-function">nCr</button>
                <button onClick={() => handleButtonClick('!')} className="btn btn-function">!</button>
                <button onClick={calculate} className="btn btn-equals">=</button>

                <button onClick={() => handleButtonClick('e')} className="btn btn-constant">e</button>
                <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">π</button>
                <button onClick={() => handleButtonClick('ans')} className="btn btn-constant">ans</button>
                <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">(</button>
                <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">)</button>
                <button onClick={() => handleButtonClick(',')} className="btn btn-parenthesis">,</button>
              </div>
            )}

            {/* Variables Tab */}
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
                <button onClick={handleDelete} className="btn btn-delete">⌫</button>

                <button onClick={() => handleButtonClick('=')} className="btn btn-var">=</button>
                <button onClick={() => handleButtonClick('/')} className="btn btn-operator">÷</button>
                <button onClick={() => handleButtonClick('x')} className="btn btn-var">x</button>
                <button onClick={() => handleButtonClick('c')} className="btn btn-var">c</button>
                <button onClick={() => handleButtonClick('v')} className="btn btn-var">v</button>
                <button onClick={() => handleButtonClick('b')} className="btn btn-var">b</button>
                <button onClick={() => handleButtonClick('n')} className="btn btn-var">n</button>
                <button onClick={() => handleButtonClick('m')} className="btn btn-var">m</button>
                <button onClick={() => handleButtonClick(',')} className="btn btn-var">,</button>
                <button onClick={handleClear} className="btn btn-clear">C</button>

                <button onClick={() => handleButtonClick('^')} className="btn btn-function">↑</button>
                <button onClick={() => handleButtonClick('(')} className="btn btn-parenthesis">(</button>
                <button onClick={() => handleButtonClick(')')} className="btn btn-parenthesis">)</button>
                <button onClick={() => handleButtonClick('[')} className="btn btn-var">[</button>
                <button onClick={() => handleButtonClick(']')} className="btn btn-var">]</button>
                <button onClick={() => handleButtonClick('!')} className="btn btn-var">!</button>
                <button onClick={() => handleButtonClick("'")} className="btn btn-var">'</button>
                <button onClick={() => handleButtonClick('pi')} className="btn btn-constant">π</button>
                <button onClick={() => handleButtonClick('+')} className="btn btn-operator">+</button>
                <button onClick={calculate} className="btn btn-equals">=</button>
              </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        <div className="history-panel">
          <div className="history-header">
            <h3>History</h3>
            <button onClick={handleClearHistory} className="clear-history-btn">
              Clear History
            </button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">No calculations yet</div>
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

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Use Our Scientific Calculator?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Private & Secure</h3>
            <p>All calculations are processed locally in your browser. No data is sent to any server, ensuring complete privacy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Advanced Functions</h3>
            <p>Full scientific calculator with trigonometry, logarithms, exponentials, statistics, and complex mathematical operations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Calculation History</h3>
            <p>Keep track of all your calculations with a detailed history panel. Quickly reuse previous calculations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>High Precision</h3>
            <p>Accurate calculations with support for complex equations, matrices, and statistical functions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⌨️</div>
            <h3>Keyboard Support</h3>
            <p>Full keyboard support for faster input. Use your keyboard for numbers, operators, and functions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>100% Free Forever</h3>
            <p>No registration required. Use all advanced scientific calculator features completely free with unlimited calculations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScientificCalculator;
