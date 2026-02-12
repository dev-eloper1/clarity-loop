## Setup Mode

Entry point for the cl-designer skill. Two phases: MCP detection and design discovery.
Always runs first — other modes gate on setup completion recorded in `DESIGN_PROGRESS.md`.

### Re-Running Setup

If `DESIGN_PROGRESS.md` already exists with completed phases beyond setup (tokens, mockups,
or build plan), warn the user: "Design progress exists with [completed phases]. Re-running
setup will reset the design direction — but your generated artifacts (DESIGN_SYSTEM.md,
UI_SCREENS.md, DESIGN_TASKS.md) will remain. Continue?"

If the user confirms, overwrite DESIGN_PROGRESS.md and reset all phase statuses to Pending.
If they cancel, exit setup.

### Phase 1: MCP Detection

Detect whether the Pencil MCP is available.

**Pencil MCP check:**
1. Use `ToolSearch` for `mcp__pencil__` tools
2. Look for: `batch_design`, `get_screenshot`, `set_variables`, `get_guidelines`, `get_style_guide_tags`
3. If found, probe with `get_guidelines("tailwind")` to verify the server is responsive
4. Record: Pencil MCP available = true/false

**Report findings to user:**

- **Pencil available**: "Pencil MCP detected. I can generate designs from scratch —
  component library, screen mockups, design tokens — all as .pen files with visual
  feedback loops."
- **Not available**: "Pencil MCP not detected. I'll produce structured markdown specs
  instead — same information, no visual artifacts. You can add Pencil MCP later and
  regenerate visuals."

### Phase 2: Design Discovery Conversation

**Gate**: A PRD (or equivalent requirements doc with UI features) must exist in system docs.
Read the PRD to understand features and UI requirements. Also read the Architecture doc if
it exists — tech stack context (Tailwind? React? Next.js?) informs design token choices.

If no PRD exists: "I need a PRD or requirements doc with UI features to design against.
Run `/cl-researcher research` to create system docs first, then come back for design."

---

#### Step 1: Visual References and Inspiration

Before asking abstract preference questions, ask for concrete visual input. Developers
often know exactly what they want their app to look like but struggle to articulate it in
design terms. Visual references short-circuit that gap.

Ask (in this order — stop as soon as you have enough to work with):

1. **Screenshots or mockups**: "Do you have any screenshots, wireframes, or mockups of
   what you're building? A folder of images, a sketch on paper — anything visual. If so,
   share the path or paste them."

   If the user provides screenshots or a folder path:
   - Read each image using the `Read` tool
   - Analyze the visual patterns: layout structure, color usage, component types, spacing
     density, typography feel
   - Summarize what you see: "From your screenshots, I can see: [layout description],
     [color palette tendency], [component style]. I'll use these as the baseline."
   - This can replace most or all of the preference questions below — if the screenshots
     are clear enough, skip to confirmation

2. **Component library**: "Are you using or planning to use a specific component library?
   For example: shadcn/ui, Material UI, Ant Design, Chakra UI, Radix, Headless UI,
   DaisyUI, or another one?"

   If the user names a component library, trigger a **mini research cycle**:
   - Use `WebSearch` to find the library's design principles, default theme, and token
     values (colors, spacing scale, border radius, typography)
   - Read the library's documentation for design guidelines (e.g., Material Design 3
     principles for Material UI, shadcn/ui's use of CSS variables and Tailwind)
   - Extract the library's default token values as a starting point
   - Present findings: "Here's what [library] uses by default:
     - Colors: [primary, neutral, semantic]
     - Typography: [font, scale]
     - Spacing: [base unit, scale]
     - Border radius: [values]
     I'll use these as the foundation and customize from there. Want to change any defaults?"
   - Record the library and its defaults in DESIGN_PROGRESS.md
   - **This research saves significant back-and-forth** — the library already embodies
     design decisions (spacing scale, color system, component API) that would otherwise
     need to be discovered through conversation

3. **Inspiration apps/sites**: "Any apps or websites you admire the design of? I can use
   these as reference points."

   If the user provides URLs:
   - Note them for reference (don't fetch — just record the inspiration)
   - Ask follow-up: "What specifically do you like about [app]? The layout? Colors?
     How it feels to use?"

#### Step 2: Design Preferences (Generate-Confirm)

**Read DECISIONS.md first.** Check for existing decisions in categories `design-direction`,
`accessibility`, `responsive`. Use existing decisions as defaults in the table below.

If Step 1 provided substantial input (component library researched, screenshots analyzed,
or inspiration sites noted), switch to generate-confirm: present a design defaults table
derived from the research, and let the user review and override.

**Generate-confirm path** (when Step 1 gave enough input):

"Based on [component library / screenshots / inspiration], here are the design defaults
I'll use. Review and mark anything you want to change:"

| Category | Value | Source | Override? |
|----------|-------|--------|-----------|
| Aesthetic | Minimal, clean | shadcn/ui defaults | |
| Primary color | Blue (oklch scale) | shadcn/ui defaults | |
| Neutral palette | Zinc gray | shadcn/ui defaults | |
| Semantic colors | Green/amber/red/blue | shadcn/ui defaults | |
| Typography | Geist Sans | shadcn/ui convention | |
| Spacing | 4px base, Tailwind scale | shadcn/ui convention | |
| Border radius | 0.5rem (md) | shadcn/ui defaults | |
| Interaction mode | Mouse-first + keyboard | DECISIONS.md | |
| Theme | Light + dark | User preference | |
| Constraints | [any from conversation] | User stated | |

The user reviews: "Change primary to indigo, bump border radius to lg, rest looks good."

**Freeform path** (when Step 1 didn't provide enough input):

Fall back to conversational discovery. Don't dump all questions at once -- have a
conversation:

1. **Overall aesthetic / mood**: "What overall feel are you going for?"
2. **Color preferences**: "Any color preferences?"
3. **Typography**: "Typography preference?"
4. **Interaction patterns**: "Keyboard-first, mouse-first, or touch-first?"
5. **Theme support**: "Dark mode, light mode, or both?"
6. **Constraints**: "Any existing brand guidelines or constraints?"

After the freeform conversation, still generate the summary table (Step 4: Confirm
Design Direction) for explicit confirmation.

#### Step 3: Style Guide (Pencil path only)

If Pencil MCP is available:
- Call `get_style_guide_tags` to see available style categories
- Match user preferences and references to tags
- Call `get_style_guide` with matching tags for design inspiration
- Show the style guide results to the user for confirmation

#### Step 4: Confirm Design Direction

Summarize everything: "Based on our discussion, here's the design direction:
- **Foundation**: [component library name + version, or "custom from scratch"]
- **Aesthetic**: [mood/feel]
- **Colors**: [palette summary]
- **Typography**: [fonts]
- **Theme**: [light/dark/both]
- **References**: [screenshots, inspiration apps]

Does this capture what you're looking for?"

---

#### Markdown Fallback Note

If Pencil MCP is not available, the same discovery conversation runs. Note upfront: "Since
Pencil MCP isn't available, I'll capture your preferences and produce structured markdown
specs. These document the same design decisions — tokens, components, screens — just without
visual artifacts."

---

### Record to DESIGN_PROGRESS.md

After completing both phases, write `{docsRoot}/designs/DESIGN_PROGRESS.md`:

```markdown
# Design Progress

**MCP path**: [Pencil | Markdown fallback]
**Started**: [date]
**Last updated**: [date]

## Setup

- **Status**: Complete
- **MCP detected**: [Pencil | None]
- **PRD reference**: [filename]

## Design Direction

[Summary of design direction]

### Component Library

[Library name and version, or "None — custom design system"]
[Key defaults extracted from library research, if applicable]

### Visual References

[Screenshots provided: list paths or descriptions]
[Inspiration apps/sites: list with notes on what the user likes about each]

### User Decisions

| Decision | Value | Source |
|----------|-------|--------|
| Aesthetic | [e.g., "Minimal, clean"] | User preference |
| Colors | [e.g., "Cool blues, gray neutrals"] | [Library default | User preference | Screenshot analysis] |
| Typography | [e.g., "Inter for UI, JetBrains Mono for code"] | [Library default | User preference] |
| Theme | [e.g., "Light + dark mode"] | User preference |
| Style guide | [e.g., "Modern SaaS" from Pencil] | get_style_guide |
| Component library | [e.g., "shadcn/ui"] | User preference |
| ... | ... | ... |

## Tokens

- **Status**: Pending

## Mockups

- **Status**: Pending

## Build Plan

- **Status**: Pending
```

Tell the user: "Setup complete. Design direction captured. Run `/cl-designer tokens` to
generate the design system."
