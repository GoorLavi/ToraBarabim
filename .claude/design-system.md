# ToraBarabim Design System

The rules below split into two kinds. **Settled** rules hold no matter what the site
ends up looking like. **Open** decisions have not been made yet: the designer
(`tora-designer`) sets them at the first design pass, the human ratifies, and they get
written down here. Do not invent a value for an open decision and treat it as a token.

Once the code has real tokens, the code is the source of truth and this file is the
human-readable mirror. Keep the two in sync.

## Settled

### Hebrew and right-to-left
The site is Hebrew only. The page renders `direction: rtl`. Use CSS logical
properties everywhere in layout.

```css
/* Good */ .row { text-align: start; padding-inline: 16px; border-inline-start: 1px solid var(--border); }
/* Bad  */ .row { text-align: left;  padding-left: 16px;  border-left: 1px solid #e0e0e0; }
```

Copy is written natively in Hebrew, never translated from English. Dates, times, and
numbers are formatted the way an Israeli reader expects them.

### Mobile first
Most people will find this site on a phone, often while out. Design the narrow screen
first and let it grow. Tap targets are thumb-sized, never mouse-sized.

### Layout must survive real data
Every layout is tested against a long rabbi name, a long place name, a missing photo,
and a lesson with almost no detail filled in. Fixed widths that only fit the sample
data are a defect.

### Every data screen has three states
Loading, empty, and error: each designed, not an afterthought. The empty state
carries the most weight on this site: someone searched for a lesson near them and
found none, and the screen has to help rather than dead-end.

### Feel
Warm and trustworthy, quietly modern. Generous type, calm color, plenty of breathing
room. The audience spans a wide range of ages and comfort with technology, and the
subject deserves dignity. Not sterile-corporate, not kitsch, not flashy. No heavy
animation.

## Open (not decided yet)

- **Color.** Brand color, text primary and secondary, border, background, and the
  accent used for dates and calls to action.
- **Type.** The Hebrew family and its weights. Candidates worth comparing: Assistant,
  Heebo, Rubik, Noto Sans Hebrew. Confirm the family carries every weight the design
  leans on before committing.
- **Spacing scale, radii, and shadows.**
- **Breakpoints and the maximum content width.**

When one of these is settled, move it up into **Settled** with its actual value and
say where it lives in code.
