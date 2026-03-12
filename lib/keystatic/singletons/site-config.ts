/**
 * Keystatic Site Config Singleton
 * REQ-KEYSTATIC-002: Camp-admin-editable branding and site configuration
 */
import { fields, singleton } from "@keystatic/core";

export const siteConfig = singleton({
  label: "Site Config",
  path: "content/singletons/site-config/site-config",
  schema: {
    siteName: fields.text({
      label: "Site Name",
      description: "The name of the camp shown in the browser tab and metadata",
      defaultValue: "Bear Lake Camp",
    }),
    logoPath: fields.text({
      label: "Logo Path",
      description: "Path to the logo image (relative to /public)",
      defaultValue:
        "/images/logo/BLC-Logo-compass-whiteletters-no-background-small.png",
    }),
    logoAlt: fields.text({
      label: "Logo Alt Text",
      description: "Accessible alt text for the logo image",
      defaultValue: "Bear Lake Camp",
    }),
    contactEmail: fields.text({
      label: "Contact Email",
      description: "Primary contact email address",
      defaultValue: "info@bearlakecamp.org",
    }),
    contactPhone: fields.text({
      label: "Contact Phone",
      description: "Primary contact phone number",
      defaultValue: "(260) 799 5988",
    }),
    contactAddress: fields.text({
      label: "Contact Address",
      description: "Physical mailing address",
      defaultValue: "1805 S 16th St, Albion, IN 46701",
    }),
    registrationUrl: fields.text({
      label: "Registration URL",
      description: "Link to the UltraCamp registration page",
    }),
    donationUrl: fields.text({
      label: "Donation URL",
      description: "Link to the UltraCamp donation page",
    }),
    emailFromName: fields.text({
      label: "Email From Name",
      description: "Display name used in outgoing emails",
      defaultValue: "Bear Lake Camp Website",
    }),
    facebookUrl: fields.text({
      label: "Facebook URL",
      description: "Link to the camp Facebook page",
    }),
    instagramUrl: fields.text({
      label: "Instagram URL",
      description: "Link to the camp Instagram profile",
    }),
    youtubeUrl: fields.text({
      label: "YouTube URL",
      description: "Link to the camp YouTube channel",
    }),
    spotifyUrl: fields.text({
      label: "Spotify URL",
      description: "Link to a camp Spotify playlist",
    }),
    mapsUrl: fields.text({
      label: "Google Maps URL",
      description: "Google Maps link to the camp location",
    }),
  },
});
