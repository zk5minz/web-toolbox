import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useCanonicalUrl } from '../utils/seoHelpers';
import './StopwatchTimer.css';

function StopwatchTimer() {
  const { t } = useTranslation(['stopwatchTimer', 'translation']);

  // Set canonical URL
  useCanonicalUrl('/stopwatch-timer');

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Free Stopwatch & Timer - Precision Time Tracking Tool | Online Tools';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free online stopwatch and countdown timer with lap time recording. Precision timing tool perfect for workouts, cooking, and productivity. Accurate to milliseconds.');
    }
  }, []);
  
  const [activeTab, setActiveTab] = useState('stopwatch');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const stopwatchIntervalRef = useRef(null);
  const stopwatchStartTimeRef = useRef(null);

  // Timer state
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const timerIntervalRef = useRef(null);
  const timerStartTimeRef = useRef(null);
  const timerRemainingRef = useRef(0);

  // Load saved settings
  useEffect(() => {
    const savedTab = localStorage.getItem('stopwatchTimerTab');
    if (savedTab) setActiveTab(savedTab);

    const savedTimerSettings = localStorage.getItem('timerSettings');
    if (savedTimerSettings) {
      const settings = JSON.parse(savedTimerSettings);
      setTimerHours(settings.hours || 0);
      setTimerMinutes(settings.minutes || 0);
      setTimerSeconds(settings.seconds || 0);
    }
  }, []);

  // Save tab selection
  useEffect(() => {
    localStorage.setItem('stopwatchTimerTab', activeTab);
  }, [activeTab]);

  // Save timer settings
  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify({
      hours: timerHours,
      minutes: timerMinutes,
      seconds: timerSeconds
    }));
  }, [timerHours, timerMinutes, timerSeconds]);

  // Prevent leaving page when timer is running
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isStopwatchRunning || isTimerRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStopwatchRunning, isTimerRunning]);

  // Stopwatch functions
  const startStopwatch = () => {
    setIsStopwatchRunning(true);
    stopwatchStartTimeRef.current = Date.now() - stopwatchTime;

    stopwatchIntervalRef.current = setInterval(() => {
      setStopwatchTime(Date.now() - stopwatchStartTimeRef.current);
    }, 10);
  };

  const pauseStopwatch = () => {
    setIsStopwatchRunning(false);
    clearInterval(stopwatchIntervalRef.current);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    clearInterval(stopwatchIntervalRef.current);
    setStopwatchTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    const lapTime = stopwatchTime;
    const previousLapTime = laps.length > 0 ? laps[laps.length - 1].time : 0;
    const split = lapTime - previousLapTime;

    setLaps([...laps, { time: lapTime, split }]);
  };

  // Timer functions
  const startTimer = () => {
    if (!isTimerRunning && timerTime === 0) {
      const totalSeconds = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
      if (totalSeconds === 0) return;

      setTimerTime(totalSeconds * 1000);
      timerRemainingRef.current = totalSeconds * 1000;
    }

    setIsTimerRunning(true);
    setIsTimerComplete(false);
    timerStartTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - timerStartTimeRef.current;
      const remaining = Math.max(0, timerRemainingRef.current - elapsed);

      setTimerTime(remaining);

      if (remaining === 0) {
        clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
        setIsTimerComplete(true);
        playBeep();
        showNotification();
      }
    }, 10);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerIntervalRef.current);
    timerRemainingRef.current = timerTime;
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsTimerComplete(false);
    clearInterval(timerIntervalRef.current);
    setTimerTime(0);
    timerRemainingRef.current = 0;
    setTimerHours(0);
    setTimerMinutes(0);
    setTimerSeconds(0);
  };

  const addQuickTime = (seconds) => {
    // Only allow adding time when timer is not running
    if (isTimerRunning) return;

    const currentTotal = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    const newTotal = currentTotal + seconds;

    setTimerHours(Math.floor(newTotal / 3600));
    setTimerMinutes(Math.floor((newTotal % 3600) / 60));
    setTimerSeconds(newTotal % 60);
  };

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('stopwatchTimer:timer.notification.title'), {
        body: t('stopwatchTimer:timer.notification.body'),
        icon: '⏱️'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(t('stopwatchTimer:timer.notification.title'), {
            body: t('stopwatchTimer:timer.notification.body'),
            icon: '⏱️'
          });
        }
      });
    }
  };

  // Format time functions
  const formatStopwatchTime = (time) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (time) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLapStats = () => {
    if (laps.length === 0) return { fastest: -1, slowest: -1 };

    const splits = laps.map(lap => lap.split);
    const fastest = laps.findIndex(lap => lap.split === Math.min(...splits));
    const slowest = laps.findIndex(lap => lap.split === Math.max(...splits));

    return { fastest, slowest };
  };

  const { fastest, slowest } = getLapStats();

  return (
    <div className="stopwatch-timer-container">
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>

      <header className="stopwatch-timer-header">
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
            🏠 {t('translation:nav.home')}
          </Link>
          <span> &gt; </span>
          <span>{t('stopwatchTimer:breadcrumb.tools')}</span>
          <span> &gt; </span>
          <span>{t('stopwatchTimer:breadcrumb.current')}</span>
        </div>
        <h1>⏱️ {t('stopwatchTimer:header.title')}</h1>
        <p>{t('stopwatchTimer:header.subtitle')}</p>
      </header>

      <div className="stopwatch-timer-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'stopwatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('stopwatch')}
          >
            {t('stopwatchTimer:tabs.stopwatch')}
          </button>
          <button
            className={`tab ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            {t('stopwatchTimer:tabs.timer')}
          </button>
        </div>

        {activeTab === 'stopwatch' ? (
          <div className="stopwatch-section">
            <div className="time-display">
              {formatStopwatchTime(stopwatchTime)}
            </div>

            <div className="button-group">
              {!isStopwatchRunning ? (
                <button className="btn btn-start" onClick={startStopwatch}>
                  {t('stopwatchTimer:buttons.start')}
                </button>
              ) : (
                <button className="btn btn-pause" onClick={pauseStopwatch}>
                  {t('stopwatchTimer:buttons.pause')}
                </button>
              )}
              <button
                className="btn btn-lap"
                onClick={recordLap}
                disabled={!isStopwatchRunning}
              >
                {t('stopwatchTimer:buttons.lap')}
              </button>
              <button className="btn btn-reset" onClick={resetStopwatch}>
                {t('stopwatchTimer:buttons.reset')}
              </button>
            </div>

            {laps.length > 0 && (
              <div className="laps-section">
                <h3>{t('stopwatchTimer:stopwatch.lapTimes')}</h3>
                <div className="laps-list">
                  {[...laps].reverse().map((lap, index) => {
                    const originalIndex = laps.length - 1 - index;
                    const lapNumber = originalIndex + 1;
                    return (
                      <div
                        key={originalIndex}
                        className={`lap-item ${
                          originalIndex === fastest && laps.length > 1 ? 'fastest' : ''
                        } ${originalIndex === slowest && laps.length > 1 ? 'slowest' : ''}`}
                      >
                        <span className="lap-number">{t('stopwatchTimer:stopwatch.lapNumber')} {lapNumber}</span>
                        <div className="lap-times">
                          <span className="lap-split">{formatStopwatchTime(lap.split)}</span>
                          <span className="lap-total">{formatStopwatchTime(lap.time)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="timer-section">
            {!isTimerRunning && timerTime === 0 && (
              <div className="timer-input-section">
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>{t('stopwatchTimer:timer.hours')}</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={timerHours}
                      onChange={(e) => setTimerHours(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                  <span className="time-separator">:</span>
                  <div className="time-input-group">
                    <label>{t('stopwatchTimer:timer.minutes')}</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                  <span className="time-separator">:</span>
                  <div className="time-input-group">
                    <label>{t('stopwatchTimer:timer.seconds')}</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                </div>

                <div className="quick-timers">
                  <button onClick={() => addQuickTime(1)}>{t('stopwatchTimer:timer.quickTimers.1sec')}</button>
                  <button onClick={() => addQuickTime(5)}>{t('stopwatchTimer:timer.quickTimers.5sec')}</button>
                  <button onClick={() => addQuickTime(10)}>{t('stopwatchTimer:timer.quickTimers.10sec')}</button>
                  <button onClick={() => addQuickTime(60)}>{t('stopwatchTimer:timer.quickTimers.1min')}</button>
                  <button onClick={() => addQuickTime(300)}>{t('stopwatchTimer:timer.quickTimers.5min')}</button>
                  <button onClick={() => addQuickTime(600)}>{t('stopwatchTimer:timer.quickTimers.10min')}</button>
                  <button onClick={() => addQuickTime(3600)}>{t('stopwatchTimer:timer.quickTimers.1hour')}</button>
                </div>
              </div>
            )}

            <div className={`time-display ${isTimerComplete ? 'complete-blink' : ''} ${timerTime > 0 && timerTime <= 10000 ? 'warning' : ''}`}>
              {formatTimerTime(timerTime)}
            </div>

            {isTimerComplete && (
              <div className="timer-complete-message">{t('stopwatchTimer:timer.complete')}</div>
            )}

            <div className="button-group">
              {!isTimerRunning ? (
                <button className="btn btn-start" onClick={startTimer}>
                  {t('stopwatchTimer:buttons.start')}
                </button>
              ) : (
                <button className="btn btn-pause" onClick={pauseTimer}>
                  {t('stopwatchTimer:buttons.pause')}
                </button>
              )}
              <button className="btn btn-reset" onClick={resetTimer}>
                {t('stopwatchTimer:buttons.reset')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>{t('stopwatchTimer:features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('stopwatchTimer:features.private.title')}</h3>
            <p>{t('stopwatchTimer:features.private.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>{t('stopwatchTimer:features.precision.title')}</h3>
            <p>{t('stopwatchTimer:features.precision.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏃</div>
            <h3>{t('stopwatchTimer:features.lapRecording.title')}</h3>
            <p>{t('stopwatchTimer:features.lapRecording.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h3>{t('stopwatchTimer:features.flexible.title')}</h3>
            <p>{t('stopwatchTimer:features.flexible.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>{t('stopwatchTimer:features.responsive.title')}</h3>
            <p>{t('stopwatchTimer:features.responsive.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>{t('stopwatchTimer:features.free.title')}</h3>
            <p>{t('stopwatchTimer:features.free.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StopwatchTimer;
