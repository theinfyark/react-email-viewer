import type { Meta, StoryObj } from "@storybook/react";
import { EmailViewer } from "../src/index";
import "../src/styles/email-viewer.css";

const sampleEml = `From: Alice <alice@example.com>
To: Bob <bob@example.com>
Subject: Storybook demo
Date: Wed, 16 Jul 2026 10:00:00 +0000
MIME-Version: 1.0
Content-Type: text/html; charset="utf-8"

<html><body><h1>Hello</h1><p>Storybook email body.</p></body></html>
`;

const meta: Meta<typeof EmailViewer> = {
  title: "EmailViewer",
  component: EmailViewer,
  args: {
    theme: "light",
    source: sampleEml,
  },
};

export default meta;
type Story = StoryObj<typeof EmailViewer>;

export const Basic: Story = {};

export const Dark: Story = {
  args: { theme: "dark" },
};

export const Empty: Story = {
  args: { source: null, emptyLabel: "Drop an email to preview" },
};

export const Base64: Story = {
  args: {
    source:
      typeof btoa !== "undefined"
        ? btoa(sampleEml)
        : Buffer.from(sampleEml).toString("base64"),
  },
};
