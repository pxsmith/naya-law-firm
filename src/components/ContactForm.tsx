"use client";

import { useState, type FormEvent } from "react";
import { siteSettings } from "@content/settings";
import styles from "./ContactForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const formspreeId = siteSettings.formspreeId;
  const endpoint = formspreeId
    ? `https://formspree.io/f/${formspreeId}`
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint) {
      setStatus("error");
      setErrorMessage(
        "Form is not yet configured. Set NEXT_PUBLIC_FORMSPREE_ID in your environment.",
      );
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        setStatus("error");
        setErrorMessage(
          body?.errors?.[0]?.message ??
            "Something went wrong. Please try again or email us directly.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Network error. Please try again or email us directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <h2>Thank you.</h2>
        <p>
          Your message has been received. A member of our team will respond
          shortly.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className={styles.field}>
        <label htmlFor="message">How can we help?</label>
        <textarea id="message" name="message" rows={6} required />
      </div>

      <p className={styles.note}>
        Submitting this form does not create an attorney-client relationship.
        Please do not include confidential information.
      </p>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
