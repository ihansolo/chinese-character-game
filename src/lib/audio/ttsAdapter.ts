import type { AudioAdapter } from "./AudioAdapter";

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function selectVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const byLang = (lang: string) =>
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()));
  return byLang("zh-TW") ?? byLang("zh-CN") ?? voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ?? null;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  cachedVoice = selectVoice(voices);
  return cachedVoice;
}

// Some browsers (notably iOS Safari on first load) report zero voices until
// a moment after the page loads. Wait briefly for the real list instead of
// permanently committing to "no Chinese voice" from an empty first read.
function waitForVoices(timeoutMs = 1000): Promise<SpeechSynthesisVoice[]> {
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  return new Promise((resolve) => {
    let done = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(voices);
    };
    const onChange = () => finish(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    setTimeout(() => finish(window.speechSynthesis.getVoices()), timeoutMs);
  });
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
    pickVoice();
  };
}

// Chrome has a long-standing bug where calling speak() in the same tick as a
// preceding cancel() can leave the synthesizer stuck "speaking" forever with
// no start/end events, which then wedges every future call too. Only cancel
// when something is actually in flight, and give the engine a tick to clear
// before queuing the next utterance.
async function speakNow(hanziChar: string, resolve: () => void) {
  const synth = window.speechSynthesis;
  if (cachedVoice === undefined) {
    cachedVoice = selectVoice(await waitForVoices());
  }
  const utterance = new SpeechSynthesisUtterance(hanziChar);
  const voice = cachedVoice;
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "zh-TW";
  }
  utterance.rate = 0.85;

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    resolve();
  };
  utterance.onend = settle;
  utterance.onerror = settle;
  // Guards against the stuck-synthesizer case above: never leave callers hanging.
  setTimeout(settle, 4000);

  synth.speak(utterance);
}

export const ttsAdapter: AudioAdapter = {
  speak(hanziChar: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
      if (synth.speaking || synth.pending) {
        synth.cancel();
        setTimeout(() => speakNow(hanziChar, resolve), 50);
      } else {
        speakNow(hanziChar, resolve);
      }
    });
  },
};
