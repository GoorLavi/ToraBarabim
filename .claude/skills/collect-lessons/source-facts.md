# Source facts

Facts about a source site that the page itself does not state, confirmed by the owner.
`/collect-lessons` reads this before every run. Add or change an entry only when the
owner confirms it, and keep the note saying who confirmed it and when.

Every value filled from here is marked in the row's `notes` as given by hand, not read
from the site. A fact stops being true when the site changes; if the site now states the
thing itself, the site wins and the entry is reported as possibly stale.

## levmeirisrael.com (הרב מאיר אליהו)
- **The three fixed lessons ("שיעורים קבועים בארץ") are on Tuesday.** The site says they
  are weekly and fixed but not which day. Confirmed by the owner, 2026-09-15; he asked
  that they not be dropped. Note on the row: "היום הושלם ידנית".
- **Addresses of two fixed lessons, not on the page:** בית הכנסת "משכן יהודה" is at
  רחוב הערבה 1, מעלה אדומים; בית הכנסת "תפארת ירושלים" (עדת היזידים) is at רחוב
  אדוניהו הכהן 26, ירושלים. Found on kipa.co.il and easy.co.il, confirmed by the owner,
  2026-09-22. Note on the row: "הכתובת נמסרה ידנית ואינה מופיעה בדף".

## tlvgreatsynagogue.org (בית הכנסת הגדול תל אביב)
- **Address: רחוב אלנבי 110, תל אביב.** Not on the `/Courses` page. Given by the owner
  with the link, 2026-09-15. Note on the row: "הכתובת נמסרה ידנית ואינה מופיעה בדף".

## hse.org.il (הרב שמואל אליהו)
- **ישיבת עטרת מרדכי is at רחוב כ"ב ילדי מעלות 1, צפת.** The page gives the lesson no
  city and no street at all. Given by the owner, 2026-09-16. Note on the row: "הכתובת
  נמסרה ידנית ואינה מופיעה בדף".

## ayal-taarog.org.il (הרב אייל עמרמי)
- **קבוע / משתנה is the colour of the time tag**, per the legend at the bottom of the
  image: solid red is קבוע, white with an outline is משתנה. There is no text saying it.
  This is the most fragile reading in the whole run: read the colour from the pixels, not
  by eye, and mark the row `needsReview` when unsure.

## yabia-omer.co.il (הרב יגאל כהן)
- **Blocks automated access, checked 2026-09-16.** `curl` gets `503 server_busy` across
  the whole domain, and a browser lands on a bot check that never finishes ("The check
  did not finish... could not stay verified. Please allow cookies"). Read it through
  Claude in Chrome on the owner's Mac, where the site already trusts the session: he
  approved opening a browser for any site that blocks automated access. Only if the
  timetable does not render there either is the source `failed`.
- **Tell the two failures apart in the file.** If the site itself refuses, the source is
  `failed` and nothing more can be done that week. If Claude in Chrome is simply not
  connected, that is a failure of the run's environment, not of the source: still mark
  the source `failed`, say in `failureReason` that the extension was not connected, and
  ask the owner to connect it and re-run this one source. The two need completely
  different things from him.

## meirtv.com (מכון מאיר)
- **Place: "מכון מאיר", שדרות המאירי 2-4, ירושלים.** The grid gives no address; this is the place the owner created on the site, 2026-10-04. Note on the row: "הכתובת לפי המקום שהבעלים יצר באתר, ואינה מופיעה במסמך".

## heichal-hamelech.com (הרב אלון עטיה)
- **Every lesson on the page is הרב אלון עטיה.** The page never names him. Given by the owner, 2026-10-05.
- **בית כנסת "אלי כהן", כפר סבא: ויצמן 181.** The page says "שלמה המלך פינת מצדה". Given by the owner, 2026-10-05.
- **בית כנסת "אוהל אברהם", גבעת זאב: אוסישקין 30.** The page says "רחוב אמנון ותמר". Given by the owner, 2026-10-05.

## haravshaked.com (הרב שקד בוהדנא)
- **The surname is "בוהדנא".** The site spells it "בוהדנה". The owner's spelling, 2026-10-05.
- **Herzliya, Tuesday: סמטת מורי אברהם עפארי 3.** The image gives the street with no number and no venue name. Given by the owner, 2026-10-05.
- **בית כנסת "אביר יעקב", חולון: נחמיה 15.** Given by the owner, 2026-10-05.
- **בית הכנסת זכרון דליה, אלעד (Friday night): drop it.** No house number could be found; the owner said to remove it, 2026-10-05.

## myofaqim.co.il (אופקים)
- **בית הכנסת "אהבת שלום": אבוחצירא 3, אופקים.** The board gives no address. Given by the owner, 2026-10-05.

## Sites the owner chose not to collect (2026-10-05)
- **mdby.org.il (המועצה הדתית בת ים):** no lesson has a street; skipped for now.
- **kehilatnitzanim.org:** last updated October 2024; a stale page never deletes a lesson that stopped. Not added.

## Place names spelled as the hand-entered lesson spells them
The server keys a duplicate on rabbi + day + place name, and misses "בהכנ"ס" against
"בית הכנסת", parentheses, and spelling variants. Where a lesson was already entered by
hand, write the row's `place` exactly as below, so the row matches that lesson instead of
creating a second one. This is a workaround, approved by the owner on 2026-09-22; it
becomes unnecessary once the server matches place names loosely enough to catch these.
Note on the row: "שם המקום הותאם לשם שבשיעור הקיים באתר".

| Rabbi | Place as the site writes it | Write it as |
|---|---|---|
| הרב אייל עמרמי | בהכנ"ס "בורכוב" | בית הכנסת בורכוב |
| הרב אייל עמרמי | בהכנ"ס "חסדי שמואל" | בית הכנסת חסדי שמואל |
| הרב אייל עמרמי | בית הכנסת מוסאיוף (musayof.co.il) | בית הכנסת מוסיוף |
| הרב אייל עמרמי | ביכנ"ס "ספרא" (פסגת זאב) | פסגת זאב בית הכנסת ספרא |
| הרב מאיר אליהו | בית הכנסת מוסאיוף (musayof.co.il) | בית הכנסת הגדול מוסאיוף |
| הרב מאיר אליהו | בית הכנסת "תפארת ירושלים" (עדת היזידים) | בית הכנסת תפארת ירושלים עדת היזדים |

## Rabbi names spelled as the rabbi's card spells them
musayof.co.il spells two rabbis differently from their cards on the site, and the import
links a name to a rabbi by its exact spelling. Write `rabbiName` as below. The owner asked,
2026-10-05, after the misspelt names had created a second card for each.
Note on the row: "בלוח מוסאיוף השם נכתב "<as written>"; נרשם כשם שבכרטיס הרב באתר".

| Site | As the site writes it | Write it as |
|---|---|---|
| musayof.co.il | הרב עופר כודרי | הרב עופר כדורי |
| musayof.co.il | הרב יוסף אוהב ציון | הרב יוסף חיים אוהב ציון |

## Expected row counts (for the sanity check)
From the run of 2026-09-15. An order-of-magnitude change fails the source.

| Site | Rows |
|---|---|
| ayal-taarog.org.il | 12 |
| yabia-omer.co.il | 10 |
| levmeirisrael.com | 10 |
| hse.org.il | 4 |
| musayof.co.il | 95 |
| tlvgreatsynagogue.org | 5 (1 kept after drops, split into 5 days) |
| hameir-laarets.org.il | 4 |
| myofaqim.co.il | 52 (20 lessons, 84 entries on the board, 64 dropped; run of 2026-10-05) |
| hl5047.co.il | 6 (run of 2026-10-06) |
