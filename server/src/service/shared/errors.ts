// Fires when a create/update assigns a lesson with an audience other than
// 'women' to a rabbi whose honorific is 'rabbanit'. Maps to 400.
export class RabbanitAudienceMustBeWomenError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Rabbi '${rabbiId}' is a rabbanit and can only teach lessons with audience 'women'`);
    this.name = 'RabbanitAudienceMustBeWomenError';
  }
}
