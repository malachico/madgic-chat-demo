declare module 'typewriter-effect/dist/core' {
  interface TypewriterOptions {
    strings?: string[];
    autoStart?: boolean;
    loop?: boolean;
    cursor?: string;
    delay?: number | 'natural';
    deleteSpeed?: number | 'natural';
    devMode?: boolean;
    wrapperClassName?: string;
    cursorClassName?: string;
    onCreateTextNode?: (character: string) => HTMLSpanElement | null;
    onRemoveNode?: (params: { node: HTMLElement; character: string }) => void;
    stringSplitter?: (string: string) => string[];
  }

  class Typewriter {
    constructor(element: HTMLElement | string, options?: TypewriterOptions);
    start(): Typewriter;
    typeString(string: string): Typewriter;
    deleteAll(speed?: number | 'natural'): Typewriter;
    deleteChars(numberOfCharacters: number): Typewriter;
    pauseFor(ms: number): Typewriter;
    callFunction(
      callback: (self: { elements: { container: HTMLElement; wrapper: HTMLElement } }) => void,
      thisArg?: object
    ): Typewriter;
    changeDelay(delay: number | 'natural'): Typewriter;
    changeDeleteSpeed(speed: number | 'natural'): Typewriter;
    stop(): Typewriter;
    pasteString(string: string): Typewriter;
  }

  export default Typewriter;
} 