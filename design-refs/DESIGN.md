# Design System Document

## 1. Overview & Creative North Star: "The Kinetic Luminary"

This design system is built for high-stakes operational environments where clarity is a requirement and professional polish is a signature. The **Creative North Star** for this system is **"The Kinetic Luminary."** 

Unlike generic dashboards that rely on rigid, boxed-in templates, this system interprets the "Duty Dashboard" as a living, breathing editorial experience. By combining the energy of the logo’s diagonal movement with the sophisticated stillness of **Glassmorphism**, we move beyond functional into the realm of the premium. 

We challenge the traditional grid by utilizing a **Bento Box** layout characterized by intentional asymmetry. Large, high-impact typography provides an authoritative hierarchy, while layered transparency ensures the user feels in control of a deep, multi-dimensional workspace.

---

## 2. Colors

The palette is anchored in a deep, authoritative navy, punctuated by high-energy accents that drive action and signal status.

### Color Roles
*   **Primary (`primary` #001d42 / `primary_container` #19335a):** The bedrock of the system. Used for navigation, deep background depth, and establishing trust.
*   **Secondary (`secondary` #006b60):** The Teal/Cyan interactive driver. Reserved for primary actions, active states, and interactive links.
*   **Tertiary (`tertiary_fixed_dim` #9dd84f):** The Lime Green "Pulse." Used exclusively for success states, active duty statuses, and progress indicators.
*   **Surface (`surface` #f7f9fb):** A clean, light gray-blue that provides the "canvas" for the system.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited** for sectioning or card definition. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` section sitting on a `surface` background provides all the definition a professional eye requires.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the surface-container tiers to create "nested" depth:
1.  **Canvas:** `surface` (#f7f9fb)
2.  **Sectioning:** `surface_container_low` (#f2f4f6)
3.  **Bento Cards:** `surface_container_lowest` (#ffffff) with Glassmorphism properties.

### The "Glass & Gradient" Rule
Floating elements (Side drawers, Modals, Overlays) should utilize **Glassmorphism**. Apply a semi-transparent `primary_container` or `surface_container_highest` with a `backdrop-filter: blur(20px)`. To provide "visual soul," use subtle linear gradients (e.g., `primary` to `primary_container`) on large-format interactive components to avoid the flat, "standard" look.

---

## 3. Typography

The typography strategy pairs **Manrope** (Headlines) with **Inter** (Body) to strike a balance between tech-forward personality and utilitarian readability.

*   **Display & Headline (Manrope):** These are the "Editorial" anchors. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) to create massive contrast against data-heavy sections. This scale conveys authority.
*   **Title & Body (Inter):** The "Workhorse." Use `title-md` (1.125rem) for card headers and `body-md` (0.875rem) for standard dashboard data. 
*   **Labels (Inter):** Use `label-sm` (0.6875rem) with increased letter-spacing (0.05rem) for metadata. This creates an organized, "instrument-panel" aesthetic.

---

## 4. Elevation & Depth

In this system, elevation is an expression of light and transparency, not just shadow.

*   **The Layering Principle:** Depth is achieved by "stacking" tones. A `surface_container_lowest` card placed on a `surface_container_low` background creates a natural lift.
*   **Ambient Shadows:** When a card requires a floating state (e.g., on hover), use an extra-diffused shadow. 
    *   *Blur:* 30px - 40px
    *   *Opacity:* 4% - 6%
    *   *Color:* Use a tinted version of `on_surface` (a deep navy-grey) rather than true black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a "Ghost Border": the `outline_variant` token at 15% opacity. Never use 100% opaque lines.
*   **Glassmorphism Depth:** For Side Drawers, use `surface_container_high` with 80% opacity and a heavy backdrop blur. This allows the dashboard "Bento" grid to softly bleed through, maintaining the user's spatial awareness.

---

## 5. Components

### Cards (The Bento Grid)
*   **Style:** `xl` rounding (1.5rem). Background is `surface_container_lowest`.
*   **Hover State:** Transition to a subtle `secondary` (Teal) "Ghost Border" and a 2% scale increase.
*   **Content:** No divider lines. Use `spacing.6` (1.3rem) to separate internal content blocks.

### Buttons
*   **Primary:** `secondary` (Teal) background with `on_secondary` (White) text. `full` rounding (pill-shape).
*   **Secondary:** `surface_container_highest` background with `primary` text.
*   **Interactions:** Smooth `200ms ease-in-out` transitions on all hover states.

### Progress Bars
*   **Track:** `surface_container_high`.
*   **Indicator:** Linear gradient from `secondary` (Teal) to `tertiary` (Lime) to signify "Kinetic" energy and completion.

### Side Drawers (Sheets)
*   **Visuals:** Full-height, `xl` rounding on the lead edge.
*   **Material:** Glassmorphic `primary_container` (85% opacity) with white text for high-contrast "Command Center" feel.

### Badges & Status
*   **Success:** `tertiary_container` with `on_tertiary_container` (Lime) text. No borders; use soft tonal shapes.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical Bento layouts. One card should span 2 columns while the others span 1 to create visual interest.
*   **Do** use `spacing.16` (3.5rem) for external margins to give the dashboard "breathing room."
*   **Do** use the `tertiary` Lime Green for "live" data points to draw the eye immediately to active duties.
*   **Do** lean into `xl` (1.5rem) and `lg` (1rem) corner radiuses to soften the technical nature of the data.

### Don't
*   **Don't** use 1px solid dividers. If you feel the need to separate, increase the white space (e.g., move from `spacing.4` to `spacing.8`).
*   **Don't** use standard "Drop Shadows." Only use the Ambient Shadow specification for a high-end, diffused look.
*   **Don't** use pure black (#000000) for text. Always use `on_surface` or `primary` for a softer, more integrated professional tone.
*   **Don't** crowd the Bento grid. If a card has too much data, move the secondary data into a side drawer sheet.