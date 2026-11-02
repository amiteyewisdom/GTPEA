// Org-wide default password assigned to newly created accounts.
// Every account created with this password has must_change_password = true,
// forcing the user to set their own password on first login.
export const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || "Gtpea@2026";
