// REQ-NAV-001 through REQ-NAV-006: Navigation Fixes and Integration Tests
// Story Points: 0.5 SP (integration test expansion)
// Status: FAILING (navigation config not yet updated)

import { describe, test, expect } from 'vitest';
import { getNavigation } from '@/lib/keystatic/navigation';
import fs from 'fs';
import path from 'path';

describe('REQ-NAV-001 — Fix Work at Camp Navigation', () => {
  test('Work at Camp dropdown includes Summer Staff link', async () => {
    const navigation = await getNavigation();
    const workAtCampMenu = navigation.menuItems.find((item) => item.label === 'Work at Camp');

    expect(workAtCampMenu).toBeDefined();
    expect(workAtCampMenu?.children).toBeDefined();

    const summerStaffLink = workAtCampMenu?.children?.find(
      (child) => child.label === 'Summer Staff'
    );

    expect(summerStaffLink).toBeDefined();
    expect(summerStaffLink?.href).toBe('/summer-staff');
  });

  test('Work at Camp dropdown includes Leaders in Training link', async () => {
    const navigation = await getNavigation();
    const workAtCampMenu = navigation.menuItems.find((item) => item.label === 'Work at Camp');

    const litLink = workAtCampMenu?.children?.find(
      (child) => child.label === 'Leaders in Training'
    );

    expect(litLink).toBeDefined();
    expect(litLink?.href).toBe('/work-at-camp-leaders-in-training');
  });

  test('Summer Staff page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'summer-staff.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('Year Round Positions page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'work-at-camp-year-round.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('Work at Camp has all three expected links', async () => {
    const navigation = await getNavigation();
    const workAtCampMenu = navigation.menuItems.find((item) => item.label === 'Work at Camp');

    expect(workAtCampMenu?.children).toHaveLength(3);

    const childLabels = workAtCampMenu?.children?.map((child) => child.label);
    expect(childLabels).toEqual(['Summer Staff', 'Leaders in Training', 'Year Round Positions']);
  });
});

describe('REQ-NAV-002 — Fix Summer Camp Navigation', () => {
  test('Summer Camp dropdown includes What to Bring link', async () => {
    const navigation = await getNavigation();
    const summerCampMenu = navigation.menuItems.find((item) => item.label === 'Summer Camp');

    expect(summerCampMenu).toBeDefined();
    expect(summerCampMenu?.children).toBeDefined();

    const whatToBringLink = summerCampMenu?.children?.find(
      (child) => child.label === 'What to Bring'
    );

    expect(whatToBringLink).toBeDefined();
    expect(whatToBringLink?.href).toBe('/summer-camp-what-to-bring');
  });

  test('Summer Camp dropdown includes FAQ link', async () => {
    const navigation = await getNavigation();
    const summerCampMenu = navigation.menuItems.find((item) => item.label === 'Summer Camp');

    const faqLink = summerCampMenu?.children?.find((child) => child.label === 'FAQ');

    expect(faqLink).toBeDefined();
    expect(faqLink?.href).toBe('/summer-camp-faq');
  });

  test('What to Bring page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'summer-camp-what-to-bring.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('FAQ page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'summer-camp-faq.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('Summer Camp has all four expected links in correct order', async () => {
    const navigation = await getNavigation();
    const summerCampMenu = navigation.menuItems.find((item) => item.label === 'Summer Camp');

    expect(summerCampMenu?.children).toHaveLength(4);

    const childLabels = summerCampMenu?.children?.map((child) => child.label);

    expect(childLabels).toEqual([
      'Camp Sessions',
      'What to Bring',
      'FAQ',
      'Parent Info',
    ]);
  });
});

describe('REQ-NAV-003 — Fix Retreats Navigation', () => {
  test('Retreats dropdown includes Defrost link', async () => {
    const navigation = await getNavigation();
    const retreatsMenu = navigation.menuItems.find((item) => item.label === 'Retreats');

    expect(retreatsMenu).toBeDefined();
    expect(retreatsMenu?.children).toBeDefined();

    const defrostLink = retreatsMenu?.children?.find((child) => child.label === 'Defrost');

    expect(defrostLink).toBeDefined();
    expect(defrostLink?.href).toBe('/retreats-defrost');
  });

  test('Defrost page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'retreats-defrost.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('Retreats has two expected links', async () => {
    const navigation = await getNavigation();
    const retreatsMenu = navigation.menuItems.find((item) => item.label === 'Retreats');

    expect(retreatsMenu?.children).toHaveLength(2);

    const childLabels = retreatsMenu?.children?.map((child) => child.label);
    expect(childLabels).toEqual(['Defrost', 'Recharge']);
  });
});

describe('REQ-NAV-005 — About Navigation', () => {
  test('About dropdown includes Our Team link', async () => {
    const navigation = await getNavigation();
    const aboutMenu = navigation.menuItems.find((item) => item.label === 'About');

    expect(aboutMenu).toBeDefined();
    expect(aboutMenu?.children).toBeDefined();

    const staffLink = aboutMenu?.children?.find((child) => child.label === 'Our Team');

    expect(staffLink).toBeDefined();
    expect(staffLink?.href).toBe('/about-our-team');
  });

  test('Our Team page file exists', () => {
    const pagePath = path.join(process.cwd(), 'content', 'pages', 'about-our-team.mdoc');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('About menu has all four expected links', async () => {
    const navigation = await getNavigation();
    const aboutMenu = navigation.menuItems.find((item) => item.label === 'About');

    expect(aboutMenu?.children).toHaveLength(4);

    const childLabels = aboutMenu?.children?.map((child) => child.label);
    expect(childLabels).toEqual(['Core Values', 'Doctrinal Statement', 'Our Team', 'Contact Us']);
  });
});

describe('REQ-NAV-006 — Navigation Integration Test Suite', () => {
  test('all navigation dropdown links return valid page files', async () => {
    const navigation = await getNavigation();

    const allLinks: Array<{ href: string; label: string }> = [];

    // Collect all internal navigation links
    navigation.menuItems.forEach((item) => {
      if (item.href && !item.href.startsWith('http')) {
        allLinks.push({ href: item.href, label: item.label });
      }

      if (item.children) {
        item.children.forEach((child) => {
          if (child.href && !child.href.startsWith('http') && !child.external) {
            allLinks.push({ href: child.href, label: child.label });
          }
        });
      }
    });

    expect(allLinks.length).toBeGreaterThan(15); // Should have at least 15+ internal links

    // Test each link has a corresponding page file
    allLinks.forEach(({ href, label }) => {
      const slug = href.substring(1); // Remove leading slash
      const pagePath = path.join(process.cwd(), 'content', 'pages', `${slug}.mdoc`);

      expect(fs.existsSync(pagePath), `Page for "${label}" (${href}) should exist at ${pagePath}`).toBe(true);
    });
  });

  test('primary CTA link is defined and external', async () => {
    const navigation = await getNavigation();

    expect(navigation.primaryCTA).toBeDefined();
    expect(navigation.primaryCTA.label).toBe('Register Now');
    expect(navigation.primaryCTA.href).toContain('ultracamp.com');
    expect(navigation.primaryCTA.external).toBe(true);
  });

  test('logo link points to homepage', async () => {
    const navigation = await getNavigation();

    expect(navigation.logo).toBeDefined();
    expect(navigation.logo.href).toBe('/');
    expect(navigation.logo.alt).toBe('Camp Otyokwah');
  });

  test('no navigation links are 404 (all pages exist)', async () => {
    const navigation = await getNavigation();

    const allInternalLinks: string[] = [];

    navigation.menuItems.forEach((item) => {
      if (item.href && !item.href.startsWith('http')) {
        allInternalLinks.push(item.href);
      }

      if (item.children) {
        item.children.forEach((child) => {
          if (child.href && !child.href.startsWith('http') && !child.external) {
            allInternalLinks.push(child.href);
          }
        });
      }
    });

    const missingPages: string[] = [];

    allInternalLinks.forEach((href) => {
      const slug = href.substring(1);
      const pagePath = path.join(process.cwd(), 'content', 'pages', `${slug}.mdoc`);

      if (!fs.existsSync(pagePath)) {
        missingPages.push(href);
      }
    });

    expect(missingPages).toEqual([]);
  });

  test('all menu items have required fields', async () => {
    const navigation = await getNavigation();

    navigation.menuItems.forEach((item) => {
      expect(item.label).toBeDefined();
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href).toBeDefined();

      if (item.children) {
        expect(Array.isArray(item.children)).toBe(true);

        item.children.forEach((child) => {
          expect(child.label).toBeDefined();
          expect(child.href).toBeDefined();
          expect(typeof child.href).toBe('string');
        });
      }
    });
  });

  test('navigation structure matches expected menu count', async () => {
    const navigation = await getNavigation();

    // Should have 6 top-level menu items:
    // About, Summer Camp, Work at Camp, Retreats, Rentals, Give
    expect(navigation.menuItems).toHaveLength(6);

    const menuLabels = navigation.menuItems.map((item) => item.label);
    expect(menuLabels).toEqual([
      'About',
      'Summer Camp',
      'Work at Camp',
      'Retreats',
      'Rentals',
      'Give',
    ]);
  });

  test('all dropdown children have unique hrefs', async () => {
    const navigation = await getNavigation();

    const allHrefs = new Set<string>();
    const duplicates: string[] = [];

    navigation.menuItems.forEach((item) => {
      if (item.children) {
        item.children.forEach((child) => {
          if (allHrefs.has(child.href)) {
            duplicates.push(child.href);
          } else {
            allHrefs.add(child.href);
          }
        });
      }
    });

    expect(duplicates).toEqual([]);
  });
});
