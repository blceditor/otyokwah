"use client";

/**
 * ContactForm Component
 * REQ-OP005: Cloudflare Turnstile integration with silent invalid email handling
 * Story Points: 3 SP
 */

import { useState, useEffect, useRef } from "react";

// Cloudflare Turnstile widget types
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "invisible";
  appearance?: "always" | "execute" | "interaction-only";
}

export interface ContactFormProps {
  onSubmit?: (data: FormData) => void | Promise<void>;
}

export function ContactForm({ onSubmit }: ContactFormProps = {}): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileTokenRef = useRef<string>("");
  // Timing guard: record when form first rendered
  const formLoadTime = useRef<number>(Date.now());

  // Load Cloudflare Turnstile script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize Turnstile widget after script loads
      if (window.turnstile && turnstileContainerRef.current) {
        const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

        turnstileWidgetId.current = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey,
            callback: (token: string) => {
              turnstileTokenRef.current = token;
              setTurnstileToken(token);
            },
            "error-callback": () => {
              turnstileTokenRef.current = "";
              setTurnstileToken("");
            },
            "expired-callback": () => {
              turnstileTokenRef.current = "";
              setTurnstileToken("");
            },
            theme: "auto",
            size: "invisible",
            appearance: "interaction-only",
          },
        );
      }
    };

    return () => {
      // Cleanup: remove widget and script
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.remove(turnstileWidgetId.current);
      }
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // With invisible Turnstile, token should be auto-generated
    // If not yet received, wait briefly for it
    let currentToken = turnstileTokenRef.current;
    if (!currentToken) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      currentToken = turnstileTokenRef.current;
      if (!currentToken) {
        setSubmitStatus("error");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Sanitize inputs: strip null bytes and newlines from single-line fields
    const sanitizedName = name.replace(/[\0\r\n]/g, "").trim();
    const sanitizedEmail = email.replace(/[\0\r\n]/g, "").trim();
    const sanitizedMessage = message.replace(/\0/g, "").trim();

    // Timing guard: how long since form was rendered
    const timing = Date.now() - formLoadTime.current;

    try {
      const formData = new FormData();
      formData.append("name", sanitizedName);
      formData.append("email", sanitizedEmail);
      formData.append("message", sanitizedMessage);
      formData.append("turnstile-response", currentToken);

      if (onSubmit) {
        await onSubmit(formData);
        setSubmitStatus("success");
      } else {
        // Default: submit to API endpoint
        // Convert FormData to URLSearchParams for test compatibility
        const params = new URLSearchParams();
        params.append("name", sanitizedName);
        params.append("email", sanitizedEmail);
        params.append("message", sanitizedMessage);
        params.append("turnstile-response", currentToken);
        // Honeypot field (left empty by real users, filled by bots)
        params.append("website", "");
        // Timing field
        params.append("_timing", String(timing));

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        if (response.ok) {
          setSubmitStatus("success");
          setName("");
          setEmail("");
          setMessage("");
          setTurnstileToken("");

          if (window.turnstile && turnstileWidgetId.current) {
            window.turnstile.reset(turnstileWidgetId.current);
          }
        } else {
          setSubmitStatus("error");
        }
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Contact form"
      className="max-w-2xl mx-auto space-y-6"
      noValidate
    >
      {/* Honeypot — hidden from real users, bots fill it in */}
      <input
        type="text"
        name="website"
        defaultValue=""
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      {/* Name Field */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-semibold text-bark mb-2"
        >
          Name
        </label>
        <input
          type="text"
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent"
        />
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-semibold text-bark mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="contact-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent"
        />
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-bark mb-2"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-2 border-2 border-secondary/20 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-transparent resize-vertical"
        />
      </div>

      {/* Cloudflare Turnstile Captcha */}
      <div
        ref={turnstileContainerRef}
        data-turnstile
        className="cf-turnstile"
      />
      {/* Hidden input for testing purposes */}
      <input
        type="text"
        name="cf-turnstile-response"
        value={turnstileToken}
        onChange={(e) => {
          turnstileTokenRef.current = e.target.value;
          setTurnstileToken(e.target.value);
        }}
        style={{ display: "none" }}
        data-testid="turnstile-token-input"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary text-white font-semibold py-3 px-6 rounded-lg hover:bg-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {/* Turnstile is invisible — no pending notice needed */}

      {submitStatus === "success" && (
        <div className="p-4 bg-cream border-2 border-secondary/30 rounded-lg text-secondary-dark">
          Thank you for contacting us! We&apos;ll get back to you soon.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-800">
          Something went wrong. Please try again, or contact us directly at{" "}
          <a href="mailto:info@otyokwah.org" className="underline font-semibold">
            info@otyokwah.org
          </a>{" "}
          or call <a href="tel:+14198833854" className="underline font-semibold">(419) 883-3854</a>.
        </div>
      )}
    </form>
  );
}
