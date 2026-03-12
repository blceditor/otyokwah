# Site Navigation Guide

## Available Pages

### Local Development URLs

**Homepage:**
- http://localhost:3001/

**Summer Camp:**
- http://localhost:3001/summer-camp (overview)
- http://localhost:3001/summer-camp-junior-high (grades 6-8)
- http://localhost:3001/summer-camp-senior-high (grades 9-12)

**Work at Camp:**
- http://localhost:3001/work-at-camp
- http://localhost:3001/work-at-camp-counselors
- http://localhost:3001/work-at-camp-kitchen-staff

**Retreats:**
- http://localhost:3001/retreats
- http://localhost:3001/retreats-adult-retreats
- http://localhost:3001/retreats-youth-groups

**Facilities:**
- http://localhost:3001/facilities
- http://localhost:3001/facilities-cabins
- http://localhost:3001/facilities-chapel
- http://localhost:3001/facilities-dining-hall
- http://localhost:3001/facilities-rec-center

**Other:**
- http://localhost:3001/about
- http://localhost:3001/contact
- http://localhost:3001/give

### Admin Interface

**Keystatic CMS:**
- http://localhost:3001/keystatic

Edit pages, navigation, and content through the Keystatic admin interface.

## URL Pattern

All pages follow the pattern: `http://localhost:3001/{slug}`

Where `{slug}` is the page filename without the `.mdoc` extension from `content/pages/`.

For example:
- `content/pages/about.mdoc` → http://localhost:3001/about
- `content/pages/summer-camp.mdoc` → http://localhost:3001/summer-camp

## Production URLs

Replace `localhost:3001` with `prelaunch.bearlakecamp.com` for production:
- https://prelaunch.bearlakecamp.com/
- https://prelaunch.bearlakecamp.com/about
- https://prelaunch.bearlakecamp.com/summer-camp
- etc.
