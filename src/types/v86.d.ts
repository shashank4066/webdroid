// Global typings for the v86 classic-script build (public/v86/libv86.js),
// which exposes `window.V86` in browsers.

type V86ImageUrl = {
  url: string;
  async?: boolean;
  size?: number;
  use_parts?: boolean;
  fixed_chunk_size?: number;
};

type V86ImageBuffer = {
  // Browsers: a File/Blob is supported natively by v86 (chunked async access
  // for files >= 256 MB, full read otherwise). ArrayBuffer is also accepted.
  buffer: File | Blob | ArrayBuffer;
};

type V86Image = V86ImageUrl | V86ImageBuffer;

interface V86Options {
  wasm_path?: string;
  memory_size?: number;
  vga_memory_size?: number;
  autostart?: boolean;
  disable_keyboard?: boolean;
  disable_mouse?: boolean;
  disable_speaker?: boolean;
  bios?: V86Image;
  vga_bios?: V86Image;
  hda?: V86Image;
  hdb?: V86Image;
  fda?: V86Image;
  fdb?: V86Image;
  cdrom?: V86Image;
  bzimage?: V86Image;
  cmdline?: string;
  initrd?: V86Image;
  multiboot?: V86Image;
  initial_state?: V86Image;
  serial_console?: {
    type: 'textarea' | 'xtermjs' | 'none';
    container?: HTMLTextAreaElement | HTMLElement;
    xterm_lib?: unknown;
  };
  screen_container?: HTMLElement | null;
  screen?: {
    container?: HTMLElement | null;
    use_graphical_text?: boolean;
    scaling?: number;
  };
  acpi?: boolean;
  boot_order?: number;
  fastboot?: boolean;
  bootmenu?: boolean;
  disable_jit?: boolean;
  network_relay_url?: string;
  log_level?: number;
}

interface V86Instance {
  run(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  restart(): void;
  add_listener(event: 'emulator-ready' | 'emulator-started' | 'emulator-stopped' | 'emulator-loaded', listener: () => void): void;
  add_listener(event: 'screen-set-size', listener: (size: [number, number, number]) => void): void;
  add_listener(event: 'mouse-enable', listener: (enabled: boolean) => void): void;
  add_listener(
    event: 'download-progress',
    listener: (progress: {
      file_index: number;
      file_count: number;
      file_name: string;
      lengthComputable: boolean;
      total: number;
      loaded: number;
    }) => void
  ): void;
  add_listener(
    event: 'download-error',
    listener: (err: { file_index: number; file_count: number; file_name: string; request: unknown }) => void
  ): void;
  add_listener(event: string, listener: (arg: never) => void): void;
  remove_listener(event: string, listener: (arg: never) => void): void;
  save_state(): Promise<ArrayBuffer>;
  restore_state(state: ArrayBuffer): Promise<void>;
  get_instruction_counter(): number;
  get_instruction_stats(): string;
  is_running(): boolean;
  keyboard_send_scancodes(codes: number[]): void;
  keyboard_send_text(text: string): void;
  screen_make_screenshot(): HTMLImageElement | null;
  screen_set_scale(sx: number, sy: number): void;
  screen_go_fullscreen(): void;
  lock_mouse(): void;
  mouse_set_enabled(enabled: boolean): void;
  keyboard_set_enabled(enabled: boolean): void;
  serial0_send(data: string): void;
}

interface Window {
  V86?: new (options: V86Options) => V86Instance;
}
