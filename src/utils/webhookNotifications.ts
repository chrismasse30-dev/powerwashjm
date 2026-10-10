interface FormSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  property_type?: string;
  package?: string;
  page_source?: string;
  created_at: string;
}

interface WebhookConfig {
  enabled: boolean;
  url: string;
  type: 'slack' | 'discord' | 'webhook' | 'google-sheets';
}

const WEBHOOK_CONFIGS: WebhookConfig[] = [];

export function configureWebhook(config: WebhookConfig) {
  const existingIndex = WEBHOOK_CONFIGS.findIndex(w => w.url === config.url);
  if (existingIndex >= 0) {
    WEBHOOK_CONFIGS[existingIndex] = config;
  } else {
    WEBHOOK_CONFIGS.push(config);
  }
}

export function getWebhookConfigs(): WebhookConfig[] {
  return [...WEBHOOK_CONFIGS];
}

function formatSlackMessage(submission: FormSubmission): object {
  const fields = [
    {
      type: "mrkdwn",
      text: `*Name:*\n${submission.name}`
    },
    {
      type: "mrkdwn",
      text: `*Phone:*\n<tel:${submission.phone}|${submission.phone}>`
    },
    {
      type: "mrkdwn",
      text: `*Email:*\n<mailto:${submission.email}|${submission.email}>`
    },
    {
      type: "mrkdwn",
      text: `*Address:*\n${submission.address}`
    },
    {
      type: "mrkdwn",
      text: `*Services:*\n${submission.services.join(', ')}`
    },
    {
      type: "mrkdwn",
      text: `*Source:*\n${submission.page_source || 'Unknown'}`
    }
  ];

  if (submission.property_type) {
    fields.push({
      type: "mrkdwn",
      text: `*Property Type:*\n${submission.property_type}`
    });
  }

  if (submission.package) {
    fields.push({
      type: "mrkdwn",
      text: `*Package:*\n${submission.package}`
    });
  }

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎯 New Quote Request Received!"
        }
      },
      {
        type: "section",
        fields: fields
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Submitted: <!date^${Math.floor(new Date(submission.created_at).getTime() / 1000)}^{date_short_pretty} at {time}|${submission.created_at}>`
          }
        ]
      },
      {
        type: "divider"
      }
    ]
  };
}

function formatDiscordMessage(submission: FormSubmission): object {
  const fields = [
    { name: "Name", value: submission.name, inline: true },
    { name: "Phone", value: submission.phone, inline: true },
    { name: "Email", value: submission.email, inline: true },
    { name: "Address", value: submission.address, inline: false },
    { name: "Services", value: submission.services.join(', '), inline: false },
    { name: "Source", value: submission.page_source || 'Unknown', inline: true }
  ];

  if (submission.property_type) {
    fields.push({ name: "Property Type", value: submission.property_type, inline: true });
  }

  if (submission.package) {
    fields.push({ name: "Package", value: submission.package, inline: true });
  }

  return {
    embeds: [{
      title: "🎯 New Quote Request Received!",
      color: 0x3B82F6,
      fields: fields,
      timestamp: submission.created_at,
      footer: {
        text: "JM Power Washing Quote System"
      }
    }]
  };
}

function formatGenericWebhook(submission: FormSubmission): object {
  return {
    event: "form_submission",
    timestamp: submission.created_at,
    submission: submission
  };
}

async function sendToWebhook(url: string, type: WebhookConfig['type'], submission: FormSubmission): Promise<boolean> {
  try {
    let payload: object;

    switch (type) {
      case 'slack':
        payload = formatSlackMessage(submission);
        break;
      case 'discord':
        payload = formatDiscordMessage(submission);
        break;
      case 'google-sheets':
        payload = {
          name: submission.name,
          phone: submission.phone,
          email: submission.email,
          address: submission.address,
          services: submission.services.join(', '),
          property_type: submission.property_type || '',
          package: submission.package || '',
          source: submission.page_source || 'Unknown',
          timestamp: submission.created_at
        };
        break;
      default:
        payload = formatGenericWebhook(submission);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Webhook ${type} failed:`, response.status, await response.text());
      return false;
    }

    console.log(`Webhook ${type} sent successfully`);
    return true;
  } catch (error) {
    console.error(`Error sending webhook ${type}:`, error);
    return false;
  }
}

export async function notifyWebhooks(submission: FormSubmission): Promise<void> {
  const enabledWebhooks = WEBHOOK_CONFIGS.filter(w => w.enabled);

  if (enabledWebhooks.length === 0) {
    console.log('No webhooks configured, skipping webhook notifications');
    return;
  }

  const promises = enabledWebhooks.map(webhook =>
    sendToWebhook(webhook.url, webhook.type, submission)
  );

  await Promise.allSettled(promises);
}

export function loadWebhooksFromEnv() {
  const slackUrl = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  const discordUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
  const customWebhookUrl = import.meta.env.VITE_CUSTOM_WEBHOOK_URL;
  const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

  if (slackUrl) {
    configureWebhook({ enabled: true, url: slackUrl, type: 'slack' });
  }

  if (discordUrl) {
    configureWebhook({ enabled: true, url: discordUrl, type: 'discord' });
  }

  if (customWebhookUrl) {
    configureWebhook({ enabled: true, url: customWebhookUrl, type: 'webhook' });
  }

  if (googleSheetsUrl) {
    configureWebhook({ enabled: true, url: googleSheetsUrl, type: 'google-sheets' });
  }
}
