# Herbwise Design Direction

## Three stylistic approaches

### Theme Name: Field Notes Apothecary
Very tactile, editorial, and botanical: the interface feels like a modern field journal with warm paper, pressed-leaf motifs, and clear scientific annotation.
**Probability:** 0.07

### Theme Name: Forest Signal
A calm, contemporary nature interface with deep greens, mineral neutrals, and a more product-like scanning workflow for quick recognition.
**Probability:** 0.03

### Theme Name: Sunlit Herbal Lab
Bright, optimistic, and educational: sun-washed cream, sage, and terracotta with a lightly playful visual language for curious learners.
**Probability:** 0.05

## Chosen approach: Field Notes Apothecary

**Design Movement:** Contemporary editorial naturalism, borrowing from botanical field guides, letterpress labels, and quiet Swiss information design.

**Core Principles:**
1. Make the scan action feel like opening a trusted field notebook, not operating a generic upload form.
2. Balance tactile warmth with crisp information hierarchy so medicinal guidance still feels credible.
3. Use asymmetry, rules, stamps, and specimen-style framing to create visual character without clutter.
4. Prefer calm, useful motion: gentle reveal, focus rings, and camera-state cues that explain what is happening.

**Color Philosophy:** A warm oat-paper base gives the page a grounded, human surface. Ink-black typography carries trust and readability. Moss green signals living plant knowledge, while a restrained clay accent marks actions and moments of attention. The signature color is a deep herbal moss that feels collected from the field rather than synthetically branded.

**Layout Paradigm:** An editorial split-screen composition: a narrow vertical specimen rail and a broad working canvas. The hero is intentionally offset, with the camera/upload module occupying the visual center of gravity and the supporting plant notes drifting around it like annotations.

**Signature Elements:**
- A small leaf-and-ring emblem that works as both wordmark companion and favicon.
- Fine botanical rule lines with tiny numbered field-note markers.
- A “specimen card” treatment for the scan preview, using a clipped corner and a plant-part label.

**Interaction Philosophy:** Every action gives immediate, legible feedback. Camera and upload are equal first-class choices. Buttons feel like physical controls through subtle press scaling and warm hover shifts. Placeholder actions explain themselves through a toast rather than dead-ending.

**Animation:** Use 180–260ms ease-out transitions. On load, let the notebook rail and scan card arrive with a small vertical offset and opacity shift. Hover states should lift or darken, never glow. When a photo is selected, crossfade the empty specimen frame into the preview and reveal the “Ready to identify” state. Respect reduced-motion preferences.

**Typography System:** Display headings use Fraunces with a soft editorial voice; body and UI text use DM Sans for clarity. Headlines are compact and slightly tight, with italic emphasis reserved for botanical names and the word “living.” Metadata is uppercase, tracked, and small like a printed field label.

**Brand Essence:** Herbwise helps curious people identify medicinal plants responsibly from the world around them, combining a gentle field-guide sensibility with a practical recognition workflow.
**Personality:** grounded, observant, reassuring.

**Brand Voice:** Headlines are clear, warm, and a little poetic; CTAs are direct and specific; microcopy reduces uncertainty rather than overselling accuracy.
- “Name what’s growing.”
- “Bring a leaf into focus.”

**Wordmark & Logo:** A compact circular mark with a single asymmetric leaf crossing a hand-drawn orbit, paired with a lowercase wordmark. The mark should feel like a specimen seal: memorable at favicon size, legible at header size, and never reliant on text inside the symbol.

**Signature Brand Color:** Herbwise Moss — #365B45.

## Style Decisions
- Use warm paper surfaces, moss ink, muted clay, and restrained dark green; avoid purple gradients, neon effects, and generic SaaS blue.
- Keep the primary scan interaction visually dominant and asymmetrically composed.
- Use generated botanical imagery only for the hero specimen collage; do not repeat one image across multiple sections.
