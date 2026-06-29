import { log, spinner as promptSpinner } from "@clack/prompts";

export const clackSpinner = promptSpinner();

/**
 * @deprecated Use `@clack/prompts` directly or import `clackSpinner` from `dkcutter/utils`. Will be removed in v7.
 */
export class Spinner {
  s: ReturnType<typeof promptSpinner>;

  constructor() {
    this.s = promptSpinner();
  }

  public start(msg?: string): this {
    this.s.start(msg);
    return this;
  }

  public stop(msg?: string): this {
    this.s.stop(msg);
    return this;
  }
}

/**
 * @deprecated Use `@clack/prompts` directly or import `clackSpinner` from `dkcutter/utils`. Will be removed in v7.
 */
export class SpinnerWrapper extends Spinner {
  public running: boolean = false;

  public start(msg?: string): this {
    this.running = true;
    this.s.start(msg);
    return this;
  }

  public stop(): this {
    this.running = false;
    this.s.stop();
    return this;
  }

  public setText(text: string): this {
    this.s.message(text);
    return this;
  }

  public succeed(text: string): this {
    this.running = false;
    this.s.stop(text);
    return this;
  }

  public info(text: string): this {
    if (this.running) {
      this.s.stop();
      this.running = false;
    }
    log.info(text);
    return this;
  }

  public fail(text: string): this {
    this.running = false;
    this.s.stop();
    log.error(text);
    return this;
  }
}

/**
 * @deprecated Use `@clack/prompts` directly or import `clackSpinner` from `dkcutter/utils`. Will be removed in v7.
 */
export const spinner = new SpinnerWrapper();
