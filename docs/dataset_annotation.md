# SentinelPay Dataset Annotation Guide

## Primary target

The primary classification target is:

- 0 = legitimate payment interaction
- 1 = fraudulent / social-engineering payment interaction

## Positive label

A sample should be labeled 1 when the interaction contains sufficient evidence
that the payment activity is part of a fraudulent or social-engineering attempt.

Examples may include:

- impersonation intended to manipulate payment behaviour
- deceptive instructions intended to cause an unauthorized payment
- coercive or manipulative payment requests
- fraudulent requests involving a new recipient
- social-engineering attempts intended to bypass normal payment safeguards

## Negative label

A sample should be labeled 0 when the interaction is legitimate and there is
no evidence that the payment interaction is part of a fraudulent social-
engineering attempt.

## Important rules

Urgency alone does not mean fraud.

A new recipient alone does not mean fraud.

A high transaction amount alone does not mean fraud.

A particular scenario name does not determine the label.

The scenario field describes context. It must not be used as a replacement
for the ground-truth label.

## Secondary annotations

Where possible, annotate:

- impersonation
- urgency
- new recipient
- suspicious payment instruction
- request to bypass verification
- credential-related request
- OTP-related request
- other relevant social-engineering indicators

These are explanatory attributes and must not automatically determine the
primary label.

## Speaker identity

Use anonymized speaker IDs.

Do not put names, phone numbers, email addresses, or other unnecessary
personal identifiers into dataset metadata.

## Provenance

Every sample must record its source.

Possible values include:

- public_dataset
- consenting_recording
- synthetic
- other_documented_source

## Consent

Human-recorded material must have appropriate consent documentation.

Do not include private recordings obtained without authorization.

## Adjudication

If two annotators disagree on the primary label, the sample should be
reviewed and resolved according to the annotation rules.

## Leakage prevention

The scenario name must not encode the label.

For example, do not create a dataset where every sample with:

    OTP_SCAM

has:

    label = 1

without legitimate counterexamples.

Training, validation, and test splits must be separated by speaker and session
where possible.

The test set must contain genuinely unseen examples.