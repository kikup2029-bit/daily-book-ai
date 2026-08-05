import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper over the browser's built-in speech recognition.
 *
 * Uses the Web Speech API, which runs in the browser — no AI service, no API
 * key, no cost. Support varies (good in Chrome and Safari, absent in Firefox),
 * so `supported` lets the UI hide the mic rather than offer a dead button.
 */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function getRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeech(options: { onFinal?: (text: string) => void } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Keep the latest callback without restarting recognition on every render.
  const onFinalRef = useRef(options.onFinal);
  onFinalRef.current = options.onFinal;

  useEffect(() => {
    setSupported(getRecognitionConstructor() !== null);
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) {
      setError("This browser can't do voice input. Try typing instead.");
      return;
    }

    setError(null);
    setInterim("");

    const recognition = new Constructor();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text;
        else pending += text;
      }
      if (pending) setInterim(pending);
      if (finalText.trim()) {
        setInterim("");
        onFinalRef.current?.(finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "";
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone access was blocked. Allow it in your browser settings.");
      } else if (code === "no-speech") {
        setError("Didn't catch that — try again.");
      } else if (code !== "aborted") {
        setError("Voice input didn't work. Try typing instead.");
      }
      setListening(false);
      setInterim("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Couldn't start the microphone.");
      setListening(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, interim, error, start, stop, toggle };
}

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const MULTIPLIERS: Record<string, number> = { hundred: 100, thousand: 1000 };

function isNumberWord(word: string) {
  return word in SMALL_NUMBERS || word in MULTIPLIERS;
}

/**
 * Converts a run of number words into a value: "three hundred fifty" → 350,
 * "two thousand five hundred" → 2500, "twenty five" → 25.
 */
function runToNumber(words: string[]): number {
  let total = 0;
  let current = 0;

  for (const word of words) {
    if (word in SMALL_NUMBERS) {
      current += SMALL_NUMBERS[word];
    } else if (word === "hundred") {
      current = (current || 1) * 100;
    } else if (word === "thousand") {
      total += (current || 1) * 1000;
      current = 0;
    }
  }
  return total + current;
}

/**
 * Cleans up dictated text so the entry parser can read it.
 *
 * Speech engines spell amounts out as words ("three hundred fifty dollars"),
 * mix in symbols, and add trailing punctuation. This turns each run of number
 * words into a single figure so "three hundred fifty" becomes 350 rather than
 * three separate numbers.
 */
export function normalizeSpokenMoney(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[.,!?]+$/, "")
    // "twenty-five" reads as one word to the tokenizer otherwise
    .replace(/-/g, " ")
    // "a hundred" behaves like "one hundred"
    .replace(/\ba hundred\b/g, "one hundred")
    .replace(/\ba thousand\b/g, "one thousand");

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const out: string[] = [];

  for (let i = 0; i < tokens.length;) {
    if (!isNumberWord(tokens[i])) {
      out.push(tokens[i]);
      i += 1;
      continue;
    }

    // Collect the whole run of number words, allowing "and" inside it
    // ("three hundred and fifty").
    const run: string[] = [];
    let j = i;
    while (j < tokens.length) {
      if (isNumberWord(tokens[j])) {
        run.push(tokens[j]);
        j += 1;
      } else if (
        tokens[j] === "and" &&
        j + 1 < tokens.length &&
        isNumberWord(tokens[j + 1]) &&
        run.length > 0
      ) {
        j += 1;
      } else {
        break;
      }
    }

    out.push(String(runToNumber(run)));
    i = j;
  }

  let text = ` ${out.join(" ")} `;

  // "20 dollars and 50 cents" → 20.50 ; "20 dollars 50" → 20.50
  text = text.replace(/(\d+)\s*dollars?\s*(?:and\s*)?(\d{1,2})\s*cents?/g, "$1.$2");
  text = text.replace(/(\d+)\s*dollars?\s*(?:and\s*)?(\d{1,2})(?=\s|$)/g, "$1.$2");
  text = text.replace(/(\d+)\s*dollars?/g, "$1");
  text = text.replace(/(\d+)\s*bucks?/g, "$1");
  text = text.replace(/(\d+)\s*cents?/g, "0.$1");
  text = text.replace(/\bpoint\s*(\d+)/g, ".$1");

  return text.replace(/\s+/g, " ").trim();
}
