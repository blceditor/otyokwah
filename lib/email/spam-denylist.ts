/**
 * Spam/disposable email domain denylist
 * REQ-OP006: Silent rejection of known disposable email domains
 */

export const SPAM_DOMAINS: ReadonlySet<string> = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "spam4.me",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "yopmail.com",
  "yopmail.fr",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "discard.email",
  "discardmail.com",
  "discardmail.de",
  "mailnesia.com",
  "maildrop.cc",
  "trashmail.com",
  "trashmail.at",
  "trashmail.io",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "trashmail.xyz",
  "10minutemail.com",
  "10minutemail.net",
  "fakeinbox.com",
  "getnada.com",
  "mohmal.com",
  "burnermail.io",
  "mailnull.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "armyspy.com",
  "einrot.de",
  "byom.de",
  "spamfree24.org",
  "spamfree24.de",
  "spamfree24.eu",
  "spamfree24.info",
  "spamfree24.net",
  "filzmail.com",
  "mt2015.com",
  "mt2016.com",
  "kurzepost.de",
  "objectmail.com",
  "ownmail.net",
  "postfach2go.de",
  "spamwc.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "wegwerfemail.de",
]);

/**
 * Extract the domain portion of an email address, lowercased and trimmed.
 * Returns empty string for invalid inputs.
 */
export function extractEmailDomain(email: string): string {
  if (!email || !email.includes("@")) return "";
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase().trim();
}

/**
 * Check whether an email address belongs to a known spam/disposable domain.
 * Returns true if the domain (or any parent domain) is on the denylist.
 * The check is case-insensitive.
 */
export function isSpamDomain(email: string): boolean {
  const domain = extractEmailDomain(email);

  if (!domain) {
    return false;
  }

  if (SPAM_DOMAINS.has(domain)) {
    return true;
  }

  // Also check parent domains (e.g. sub.mailinator.com → mailinator.com)
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join(".");
    if (SPAM_DOMAINS.has(parentDomain)) {
      return true;
    }
  }

  return false;
}
