import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 22, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

// Paths are hand-placed with small irregularities so they read as drawn, not stamped.
export const IconGear = (p: P) => (
  <Svg {...p}>
    <path d="M12 8.7c1.9-.1 3.4 1.4 3.3 3.3-.1 1.8-1.5 3.2-3.3 3.2-1.9.1-3.3-1.4-3.3-3.2 0-1.8 1.5-3.3 3.3-3.3z" />
    <path d="M12 2.6v2.6M12 18.8v2.6M2.7 12h2.6M18.7 12h2.6M5.4 5.5l1.9 1.8M16.7 16.8l1.8 1.8M5.5 18.6l1.8-1.9M16.8 7.2l1.7-1.8" />
  </Svg>
);
export const IconCards = (p: P) => (
  <Svg {...p}>
    <path d="M4.2 7.4l5.4-2.1 4.3 11.3-5.5 2.1z" />
    <path d="M10.6 4.6l5.8-.1.1 12.1-5.6.1" />
    <path d="M15.5 5.3l4.3 2.3-5.2 10.8" />
    <path d="M7.2 9.6l.6 1.6" />
  </Svg>
);
export const IconPassport = (p: P) => (
  <Svg {...p}>
    <path d="M6 3.4h10.8c.7 0 1.2.5 1.2 1.2v14.8c0 .7-.5 1.2-1.2 1.2H6.1c-.6 0-1.1-.5-1.1-1.1V4.5c0-.6.4-1.1 1-1.1z" />
    <path d="M11.5 7.9c1.6 0 2.8 1.2 2.8 2.7 0 1.6-1.3 2.8-2.8 2.8-1.5 0-2.7-1.2-2.7-2.8 0-1.5 1.2-2.7 2.7-2.7z" />
    <path d="M8.8 10.6h5.4M11.5 7.9c-.8 1-.8 4.5 0 5.5M11.5 7.9c.9 1 .9 4.5 0 5.5M8.6 16.6h5.9" />
  </Svg>
);
export const IconYarn = (p: P) => (
  <Svg {...p}>
    <path d="M11 4.3c3.9-.2 7.1 2.9 7 6.8-.1 3.8-3.2 6.9-7 6.8-3.8 0-6.8-3.1-6.8-6.9C4.3 7.3 7.3 4.4 11 4.3z" />
    <path d="M5.3 8.4c3.4.3 7.6 3.3 9.9 8.3M7.6 5.4c2.8 1.6 6.6 6.1 7.5 11.7M13.6 4.7c-2.7 1.8-6.5 6.5-8.5 9.5M17.5 9.3c-3.5-.4-8.5 3-10.2 7.2" />
    <path d="M16.6 17c1.3 1.7 2.9 2.8 4.9 2.6" />
  </Svg>
);
export const IconScissors = (p: P) => (
  <Svg {...p}>
    <path d="M6.4 4c1.5 0 2.6 1.2 2.6 2.6S7.8 9.2 6.4 9.2 3.8 8 3.8 6.6 4.9 4 6.4 4zM6.4 14.8c1.5 0 2.6 1.2 2.6 2.6S7.8 20 6.4 20s-2.6-1.2-2.6-2.6 1.1-2.6 2.6-2.6z" />
    <path d="M8.4 8.3L20.2 17M8.4 15.7L20.1 7" />
  </Svg>
);
export const IconNote = (p: P) => (
  <Svg {...p}>
    <path d="M5 4.2h14.1v10.4l-4.6 5.1H5.1z" />
    <path d="M14.5 19.6l-.1-4.8 4.7-.1" />
    <path d="M8 8.5c2 .3 4.2-.3 6.8 0M8 11.5c1.7.2 3 0 4.4.1" />
  </Svg>
);
export const IconShuffle = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 7.2h3.6c4.3 0 5.3 9.6 9.8 9.6h3.6M3.5 16.8h3.6c1.6 0 2.7-1.3 3.6-3M13.3 10c.9-1.6 2-2.8 3.6-2.8h3.6" />
    <path d="M18.3 4.9l2.3 2.3-2.3 2.3M18.3 14.5l2.3 2.3-2.3 2.3" />
  </Svg>
);
export const IconQuadrants = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.2v17.6M3.2 12h17.6" />
    <path d="M6.4 6.1h2.3v2.4H6.4zM15.3 15.4h2.4v2.3h-2.4z" fill="currentColor" stroke="none" />
    <path d="M15.3 6.1h2.4v2.4h-2.4zM6.4 15.4h2.3v2.3H6.4z" />
  </Svg>
);
export const IconBookmark = (p: P) => (
  <Svg {...p}>
    <path d="M6.8 3.6h10.3v16.8l-5.2-4.1-5.1 4.2z" />
  </Svg>
);
export const IconOverlay = (p: P) => (
  <Svg {...p}>
    <path d="M3.8 6.6h11.6v11.2H3.8z" />
    <path d="M8.6 3.8h11.6v11.3" strokeDasharray="2 2.4" />
  </Svg>
);
export const IconStamp = (p: P) => (
  <Svg {...p}>
    <path d="M9.6 3.8c1.5-.6 3.4-.6 4.8 0 .3 1.8-.9 3.6-1 5.5 0 .9 2.6 1.1 5 1.6 1.4.3 1.8 1.3 1.8 2.4v1.4H3.8v-1.4c0-1.1.5-2.1 1.8-2.4 2.4-.5 5-.7 5-1.6-.1-1.9-1.3-3.7-1-5.5z" />
    <path d="M5.5 17.9h13" />
    <path d="M7 20.4h10" strokeDasharray="1.5 2" />
  </Svg>
);
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19.5 12.2c-4.8-.3-9.7.1-14.6-.1M10.2 6.6L4.6 12l5.5 5.6" />
  </Svg>
);
export const IconArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 11.8c4.8.3 9.7-.1 14.6.1M13.8 6.4l5.6 5.6-5.5 5.6" />
  </Svg>
);
export const IconPerson = (p: P) => (
  <Svg {...p}>
    <path d="M12 4.1c1.9 0 3.3 1.5 3.3 3.4 0 1.8-1.5 3.3-3.3 3.3-1.9 0-3.3-1.5-3.3-3.3 0-1.9 1.4-3.4 3.3-3.4zM5.2 19.9c.5-4 3.4-6.4 6.8-6.4 3.5 0 6.4 2.4 6.8 6.4" />
  </Svg>
);
export const IconPen = (p: P) => (
  <Svg {...p}>
    <path d="M4.3 19.7l1-4.4L15.9 4.6c.8-.8 2-.8 2.8 0l.7.7c.8.8.8 2 0 2.8L8.8 18.7z" />
    <path d="M14 6.6l3.4 3.4M4.3 19.7c3.4-.2 8.3.2 15.4 0" />
  </Svg>
);
export const IconShare = (p: P) => (
  <Svg {...p}>
    <path d="M12 15.2V3.8M7.8 7.8L12 3.6l4.2 4.3" />
    <path d="M7 10.6H5.2v9.6h13.6v-9.6H17" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5.2v13.6M5.2 12.1h13.6" />
  </Svg>
);
export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5.2 12.1h13.6" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6.2 6.1l11.6 11.8M17.9 6.2L6.1 17.8" />
  </Svg>
);
export const IconPlay = (p: P) => (
  <Svg {...p}>
    <path d="M8 5.3l10.6 6.6-10.5 6.8z" />
  </Svg>
);
export const IconPause = (p: P) => (
  <Svg {...p}>
    <path d="M8.6 5.6v12.8M15.4 5.6v12.8" />
  </Svg>
);
export const IconEye = (p: P) => (
  <Svg {...p}>
    <path d="M2.8 12.1c2.2-3.8 5.4-5.8 9.2-5.8s7 2 9.2 5.8c-2.2 3.7-5.4 5.6-9.2 5.6s-7-1.9-9.2-5.6z" />
    <path d="M12 9.4c1.5 0 2.6 1.2 2.6 2.6 0 1.5-1.1 2.6-2.6 2.6s-2.6-1.1-2.6-2.6c0-1.4 1.1-2.6 2.6-2.6z" />
  </Svg>
);
export const IconThread = (p: P) => (
  <Svg {...p}>
    <path d="M5 4.4h4.2v4.3H5zM14.8 9.8H19v4.3h-4.2zM5 15.3h4.2v4.3H5z" />
    <path d="M9.2 6.6c3.6 0 2.6 5.3 5.6 5.4M14.8 12c-3.2.1-2.4 5.4-5.6 5.4" />
  </Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.6c4.7-.1 8.5 3.7 8.4 8.4 0 4.6-3.8 8.4-8.4 8.4-4.7 0-8.4-3.8-8.4-8.4S7.3 3.6 12 3.6z" />
    <path d="M12 7.2v5.1l3.4 2" />
  </Svg>
);
export const IconUpload = (p: P) => (
  <Svg {...p}>
    <path d="M12 15.6V4.2M7.6 8.5L12 4.1l4.4 4.4M4.4 15.2v4.5h15.2v-4.5" />
  </Svg>
);
export const IconLink = (p: P) => (
  <Svg {...p}>
    <path d="M10.4 13.6c1.6 1.6 3.9 1.6 5.4 0l3-3c1.5-1.5 1.5-3.9 0-5.4-1.5-1.5-3.9-1.5-5.4 0l-1.1 1.1" />
    <path d="M13.6 10.4c-1.6-1.6-3.9-1.6-5.4 0l-3 3c-1.5 1.5-1.5 3.9 0 5.4 1.5 1.5 3.9 1.5 5.4 0l1.1-1.1" />
  </Svg>
);
export const IconTicket = (p: P) => (
  <Svg {...p}>
    <path d="M3.6 7.2h16.8v3c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8v3H3.6v-3c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8z" />
    <path d="M14.6 7.4v9.2" strokeDasharray="1.4 1.8" />
  </Svg>
);
