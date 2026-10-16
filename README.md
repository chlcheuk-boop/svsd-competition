# Rhyme

A visual-reference app where creatives connect the media they love with yarn, tell the story behind each connection, and meet four people a week, dealt as tarot cards.

This is a clickable, high-fidelity prototype. It has no backend: all data is mocked in `src/data/`, and state is saved to `localStorage`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. It is designed for a 1440×900 presentation screen and still works at tablet width.

## Demo script (the pitch path)

1. **Board.** Press **Note** (or `n`) to add a reference, then click anywhere to drop it. Press **Yarn** (`y`), click the new card and then an existing one, and write a why on the tag. Press **Scissors** (`x`) and snip an old string. You can undo the snip from the toast.
2. **Matches of the week** (the card-fan icon). Press **reveal all**, then click **II · The Lens** (Kenji).
3. Press **View their board**, then turn on **overlay**. Shared posters glow lime and your own board fades to 20% behind his.
4. Press **Yarn** to start a Crossing. Tie two of Kenji's cards and write a why (it's required). Kenji ties one back. Press **see it on your board** to land on his stamped string.
5. Open the **Passport** and click the cover. Kenji's comment is the fresh stamp marked "new". Click it, then **show on my board** to jump back to that string.

To reset before presenting, go to **Settings → Demo**. You can reset the board and matches, or replay onboarding.

## Other features

- Shift-click 3 to 7 tied cards (or use **Make a thread** in the side panel) to publish a thread. Threads open as a vertical story with one continuous yarn running down the page.
- **Time replay** is in the side panel and on the Profile.
- **Ripple view** is in the side panel for anything a past match influenced.
- Pan by dragging empty space or holding space. Zoom with ctrl/⌘ + scroll, the zoom control, or `+` / `-`.

## Swapping in real media

Every card renders generated placeholder art from `art` (see `src/components/board/MediaArt.tsx`). If you set `imageData` (a data URL) or upload through the Note tool, the real image is used instead.

## Structure

- `src/components/board/`: canvas (`BoardView`), sewn-in yarn, paper cards, why tags, note composer, side panel
- `src/components/tarot/`: original tarot line illustrations and card backs
- `src/components/passport/`: ink-bleed stamps
- `src/pages/`: Board, Matches, Match board and Crossing, Passport, Thread, Profile, Settings, Onboarding
- `src/store/store.tsx`: reducer, plus `localStorage` persistence (wrapped in try/catch)
