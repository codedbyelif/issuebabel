const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

export const logger = {
  error: (msg: string) => console.error(`${RED}${BOLD}✖ ${msg}${RESET}`),
  warn:  (msg: string) => console.warn(`${YELLOW}⚠ ${msg}${RESET}`),
  success:(msg: string) => console.log(`${GREEN}✔ ${msg}${RESET}`),
  info:  (msg: string) => console.log(`${CYAN}ℹ ${msg}${RESET}`),
  dim:   (msg: string) => console.log(`${DIM}${msg}${RESET}`),
  banner:(title: string) => console.log(`\n${BOLD}${CYAN}issuebabel${RESET} ${DIM}—${RESET} ${title}\n`),
};
