// Exactly two rows below `md`, whatever the item count: the grid replaces a
// row that used to wrap onto a second line of its own accord, so the number
// of rows is fixed and only the column count grows with the tab count. Two
// named cases anchor the ceiling: four tabs (the rabbi panel, once courses
// lands) read as 2 by 2; five or six (the admin panel) read as 3 by 2, the
// six-tab case exactly full and the five-tab case one empty cell short.
export const gridColumns = (itemCount: number): number => Math.ceil(itemCount / 2);
