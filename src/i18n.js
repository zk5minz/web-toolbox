import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import koTranslation from './locales/ko/translation.json';
import jaTranslation from './locales/ja/translation.json';
import zhTranslation from './locales/zh/translation.json';
import esTranslation from './locales/es/translation.json';

import enNotepad from './locales/en/notepad.json';
import koNotepad from './locales/ko/notepad.json';
import jaNotepad from './locales/ja/notepad.json';
import zhNotepad from './locales/zh/notepad.json';
import esNotepad from './locales/es/notepad.json';

import enImageConverter from './locales/en/imageConverter.json';
import koImageConverter from './locales/ko/imageConverter.json';
import jaImageConverter from './locales/ja/imageConverter.json';
import zhImageConverter from './locales/zh/imageConverter.json';
import esImageConverter from './locales/es/imageConverter.json';

import enCharacterCounter from './locales/en/characterCounter.json';
import koCharacterCounter from './locales/ko/characterCounter.json';
import jaCharacterCounter from './locales/ja/characterCounter.json';
import zhCharacterCounter from './locales/zh/characterCounter.json';
import esCharacterCounter from './locales/es/characterCounter.json';

import enBackgroundRemover from './locales/en/backgroundRemover.json';
import koBackgroundRemover from './locales/ko/backgroundRemover.json';
import jaBackgroundRemover from './locales/ja/backgroundRemover.json';
import zhBackgroundRemover from './locales/zh/backgroundRemover.json';
import esBackgroundRemover from './locales/es/backgroundRemover.json';

import enColorExtractor from './locales/en/colorExtractor.json';
import koColorExtractor from './locales/ko/colorExtractor.json';
import jaColorExtractor from './locales/ja/colorExtractor.json';
import zhColorExtractor from './locales/zh/colorExtractor.json';
import esColorExtractor from './locales/es/colorExtractor.json';

import enAudioConverter from './locales/en/audioConverter.json';
import koAudioConverter from './locales/ko/audioConverter.json';
import jaAudioConverter from './locales/ja/audioConverter.json';
import zhAudioConverter from './locales/zh/audioConverter.json';
import esAudioConverter from './locales/es/audioConverter.json';

import enVideoConverter from './locales/en/videoConverter.json';
import koVideoConverter from './locales/ko/videoConverter.json';
import jaVideoConverter from './locales/ja/videoConverter.json';
import zhVideoConverter from './locales/zh/videoConverter.json';
import esVideoConverter from './locales/es/videoConverter.json';

import enQrgenerator from './locales/en/qrGenerator.json';
import koQrgenerator from './locales/ko/qrGenerator.json';
import jaQrgenerator from './locales/ja/qrGenerator.json';
import zhQrgenerator from './locales/zh/qrGenerator.json';
import esQrgenerator from './locales/es/qrGenerator.json';

import enNumbercounter from './locales/en/numbercounter.json';
import koNumbercounter from './locales/ko/numbercounter.json';
import jaNumbercounter from './locales/ja/numbercounter.json';
import zhNumbercounter from './locales/zh/numbercounter.json';
import esNumbercounter from './locales/es/numbercounter.json';

import enWorldclock from './locales/en/worldclock.json';
import koWorldclock from './locales/ko/worldclock.json';
import jaWorldclock from './locales/ja/worldclock.json';
import zhWorldclock from './locales/zh/worldclock.json';
import esWorldclock from './locales/es/worldclock.json';

import enPasswordGenerator from './locales/en/passwordGenerator.json';
import koPasswordGenerator from './locales/ko/passwordGenerator.json';
import jaPasswordGenerator from './locales/ja/passwordGenerator.json';
import zhPasswordGenerator from './locales/zh/passwordGenerator.json';
import esPasswordGenerator from './locales/es/passwordGenerator.json';

import enStopwatchTimer from './locales/en/stopwatchTimer.json';
import koStopwatchTimer from './locales/ko/stopwatchTimer.json';
import jaStopwatchTimer from './locales/ja/stopwatchTimer.json';
import zhStopwatchTimer from './locales/zh/stopwatchTimer.json';
import esStopwatchTimer from './locales/es/stopwatchTimer.json';

import enScientificCalculator from './locales/en/scientificCalculator.json';
import koScientificCalculator from './locales/ko/scientificCalculator.json';
import jaScientificCalculator from './locales/ja/scientificCalculator.json';
import zhScientificCalculator from './locales/zh/scientificCalculator.json';
import esScientificCalculator from './locales/es/scientificCalculator.json';

const resources = {
  en: {
    translation: enTranslation,
    notepad: enNotepad,
    imageConverter: enImageConverter,
    characterCounter: enCharacterCounter,
    backgroundRemover: enBackgroundRemover,
    colorExtractor: enColorExtractor,
    audioConverter: enAudioConverter,
    videoConverter: enVideoConverter,
    qrgenerator: enQrgenerator,
    numbercounter: enNumbercounter,
    worldclock: enWorldclock,
    passwordGenerator: enPasswordGenerator,
    stopwatchTimer: enStopwatchTimer,
    scientificCalculator: enScientificCalculator
  },
  ko: {
    translation: koTranslation,
    notepad: koNotepad,
    imageConverter: koImageConverter,
    characterCounter: koCharacterCounter,
    backgroundRemover: koBackgroundRemover,
    colorExtractor: koColorExtractor,
    audioConverter: koAudioConverter,
    videoConverter: koVideoConverter,
    qrgenerator: koQrgenerator,
    numbercounter: koNumbercounter,
    worldclock: koWorldclock,
    passwordGenerator: koPasswordGenerator,
    stopwatchTimer: koStopwatchTimer,
    scientificCalculator: koScientificCalculator
  },
  ja: {
    translation: jaTranslation,
    notepad: jaNotepad,
    imageConverter: jaImageConverter,
    characterCounter: jaCharacterCounter,
    backgroundRemover: jaBackgroundRemover,
    colorExtractor: jaColorExtractor,
    audioConverter: jaAudioConverter,
    videoConverter: jaVideoConverter,
    qrgenerator: jaQrgenerator,
    numbercounter: jaNumbercounter,
    worldclock: jaWorldclock,
    passwordGenerator: jaPasswordGenerator,
    stopwatchTimer: jaStopwatchTimer,
    scientificCalculator: jaScientificCalculator
  },
  zh: {
    translation: zhTranslation,
    notepad: zhNotepad,
    imageConverter: zhImageConverter,
    characterCounter: zhCharacterCounter,
    backgroundRemover: zhBackgroundRemover,
    colorExtractor: zhColorExtractor,
    audioConverter: zhAudioConverter,
    videoConverter: zhVideoConverter,
    qrgenerator: zhQrgenerator,
    numbercounter: zhNumbercounter,
    worldclock: zhWorldclock,
    passwordGenerator: zhPasswordGenerator,
    stopwatchTimer: zhStopwatchTimer,
    scientificCalculator: zhScientificCalculator
  },
  es: {
    translation: esTranslation,
    notepad: esNotepad,
    imageConverter: esImageConverter,
    characterCounter: esCharacterCounter,
    backgroundRemover: esBackgroundRemover,
    colorExtractor: esColorExtractor,
    audioConverter: esAudioConverter,
    videoConverter: esVideoConverter,
    qrgenerator: esQrgenerator,
    numbercounter: esNumbercounter,
    worldclock: esWorldclock,
    passwordGenerator: esPasswordGenerator,
    stopwatchTimer: esStopwatchTimer,
    scientificCalculator: esScientificCalculator
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko', 'ja', 'zh', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
