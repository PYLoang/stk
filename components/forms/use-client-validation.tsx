"use client";

import { useCallback, useState } from "react";
import type React from "react";

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function fieldKey(el: FieldElement) {
  return el.dataset.fieldKey || el.name;
}

function labelFor(el: FieldElement) {
  return el.dataset.label || el.name || "This field";
}

function messageFor(el: FieldElement) {
  const label = labelFor(el);

  if (el.validity.valueMissing) return `${label} is required`;
  if (el.validity.rangeUnderflow) return `${label} must be at least ${el.getAttribute("min")}`;
  if (el.validity.rangeOverflow) return `${label} must be at most ${el.getAttribute("max")}`;
  if (el.validity.stepMismatch) return `${label} must use a valid increment`;
  if (el.validity.typeMismatch) return `${label} is invalid`;
  if (el.validity.patternMismatch) return `${label} is invalid`;

  return el.validationMessage || `${label} is invalid`;
}

function fieldElements(form: HTMLFormElement) {
  return Array.from(form.elements).filter((el): el is FieldElement => {
    return (
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) &&
      Boolean(el.name) &&
      el.willValidate
    );
  });
}

export function useClientValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((form: HTMLFormElement) => {
    const next: Record<string, string> = {};

    for (const el of fieldElements(form)) {
      if (!el.validity.valid) {
        next[fieldKey(el)] = messageFor(el);
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, []);

  const validateField = useCallback((el: FieldElement) => {
    const key = fieldKey(el);

    setErrors((current) => {
      const next = { ...current };

      if (el.validity.valid) {
        delete next[key];
      } else if (current[key]) {
        next[key] = messageFor(el);
      }

      return next;
    });
  }, []);

  const formProps = {
    noValidate: true,
    onSubmitCapture: (event: React.FormEvent<HTMLFormElement>) => {
      if (!validateForm(event.currentTarget)) {
        event.preventDefault();
      }
    },
    onInvalidCapture: (event: React.InvalidEvent<HTMLFormElement>) => {
      event.preventDefault();
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        setErrors((current) => ({ ...current, [fieldKey(target)]: messageFor(target) }));
      }
    },
    onInputCapture: (event: React.FormEvent<HTMLFormElement>) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        validateField(target);
      }
    },
  };

  const fieldProps = (key: string, label: string) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    "data-field-key": key,
    "data-label": label,
  });

  const error = (key: string) =>
    errors[key] ? (
      <div className="field-error" id={`${key}-error`}>
        {errors[key]}
      </div>
    ) : null;

  return { errors, formProps, fieldProps, error };
}
