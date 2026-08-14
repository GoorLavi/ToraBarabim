// One entry read out of the page's rawLecturesData array, before it is
// turned into a RawLesson.
export interface OneOffLecture {
  dateStr: string;
  city: string;
  place: string;
  time: string;
}

// One entry read out of a .fixed-item block.
export interface RecurringLecture {
  city: string;
  place: string;
  time: string;
}
