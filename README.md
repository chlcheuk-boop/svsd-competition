# Rhyme

A board for building your own identity out of your actual life: the places you go, photos you take, events you show up to, small things you notice, and the media you love. You tie them together with yarn and write why, both for each string and for each thing on its own. Instead of a feed of everyone, you meet four people a week, dealt as tarot cards, and the inspiration they bring gets added to your life with its story attached.

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
3. Press **See where you meet**. You see only the slice of Kenji's board that meets yours (for The Lens: the posters you share, and the different strings he ran from them). Turn on **what's shared** to make the shared cards glow.
4. Press **Yarn** to start a Crossing. Tie two of Kenji's cards and write a why (it's required). Kenji ties one back. Press **see it on your board** to land on his stamped string.
5. Open the **Passport** and click the cover. Kenji's comment is the fresh stamp marked "new". Click it, then **show on my board** to jump back to that string.

After onboarding, a short board tour spotlights each tool: connections and their whys, snipping, notes, threads, matching and the passport.

To reset before presenting, go to **Settings → Demo**. You can reset the board and matches, replay onboarding, or replay the board tour.

## What goes on the board

The **note** tool adds things from your life or media:

- **From your life:** a photo (take one with the camera or pick one from your library), a place (with "use where I am"), an event (with a date), or something you noticed.
- **Media:** image, music, film or video, quote, link, or object.

Every entry can have its own **why it matters to you**. It shows when you open the card, and you can write or edit it there.

## Other features

- **Arrange** on the board toolbar switches between a tidy grid **by kind** (the default: places, photos, events, things noticed, then each kind of media), a grid **by theme**, and **my layout**, where you place and drag cards by hand. The grids keep cards straight so only the yarn is loose.

- In the **Passport**, clicking a stamp opens your whole history with that person: every note they left, the strings each of you tied on the other's board, and what you traded.

- Shift-click any chain of tied cards (no length limit, each pair just needs a string) (or use **Make a thread** in the side panel) to publish a thread. The **threads** tool shows every thread traced on the board in its own color. Threads open as a vertical story with one continuous yarn running down the page.
- **Time replay** is in the side panel and on the passport's visibility page.
- **The passport** opens on your ID and profile; your photo leads to settings, and index tabs down the side jump to profile, threads and stamps.
- **Ripple view** is in the side panel for anything a past match influenced.
- Shortcuts: <kbd>Ctrl</kbd>+<kbd>Y</kbd> yarn, <kbd>Ctrl</kbd>+<kbd>S</kbd> scissors, <kbd>Ctrl</kbd>+<kbd>N</kbd> new note, <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo the last string you tied or snipped (⌘ works too on Mac). The single keys `y`, `x`, `n`, `t` still work.
- Pan by dragging empty space or holding space. Zoom with ctrl/⌘ + scroll, the zoom control, or `+` / `-`.

## Swapping in real media

Every card renders generated placeholder art from `art` (see `src/components/board/MediaArt.tsx`). If you set `imageData` (a data URL) or upload through the Note tool, the real image is used instead.

## Structure

- `src/components/board/`: canvas (`BoardView`), sewn-in yarn, paper cards, why tags, note composer, side panel
- `src/components/tarot/`: original tarot line illustrations and card backs
- `src/components/passport/`: ink-bleed stamps
- `src/pages/`: Board, Matches, Match board and Crossing, Passport (with your ID and profile), Thread, Settings, Onboarding
- `src/store/store.tsx`: reducer, plus `localStorage` persistence (wrapped in try/catch)
