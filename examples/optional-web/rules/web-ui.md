# Web UI Rules

## Accessibility

- Use semantic elements before ARIA.
- All controls need accessible names.
- All form inputs need associated labels.
- Error messages should be associated with the relevant field.
- Keyboard users must be able to reach and operate every interactive control.
- Focus indicators must be visible.
- Do not rely on color alone to convey meaning.
- Maintain contrast appropriate for normal text, large text, and non-text UI.

## Responsive Behavior

- Design mobile-first.
- Avoid horizontal overflow at the smallest supported viewport.
- Interactive controls should have practical touch targets.
- Text should remain readable when browser font size changes.
- Images and media should preserve aspect ratio and avoid layout overflow.
- Fixed-format widgets need stable dimensions so labels and state changes do not
  shift layout unexpectedly.

## Interaction States

Provide states where relevant:

- default
- hover
- active
- focus
- disabled
- loading
- error
- empty
- success

## Design System

- Use existing primitives and tokens before creating new ones.
- Do not mix component systems without an explicit decision.
- Do not hardcode visual values when a project token exists.
- If the design source is missing, report the gap rather than inventing a new
  visual language.
