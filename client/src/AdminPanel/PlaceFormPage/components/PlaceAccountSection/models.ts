export interface PlaceAccountSectionProps {
  className?: string;
  // Undefined until the place itself has been saved once: an account needs
  // a place id to attach to, so this section cannot do anything until then.
  placeId: string | undefined;
  // Used only to prefill the create-form's username suggestion. The parent
  // page owns the place's name field and can still change it while this
  // section is visible, so the suggestion stays in sync until the admin
  // edits the username field themselves.
  placeName: string;
}

// Held only in this component's own state, never in the query cache and
// never round-tripped through a URL: the server returns a temporary
// password exactly once (create and reset-password), so this is the only
// copy that will ever exist on the client.
export interface RevealedPassword {
  email: string;
  temporaryPassword: string;
}
