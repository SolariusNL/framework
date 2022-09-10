# `framework.yml` Configuration

The `framework.yml` file is the main configuration file for Framework. It is located in the root of the project, and it is used to configure the server, custom features, mail delivery, and more.

## Features

### Additional

#### Support Ukraine Header

This feature shows a banner on all pages with an option to support Ukraines fight against Russian aggression.

**Example:**

```yaml title="framework.yml"
features:
  additional:
    ukraine:
      enabled: true
      supportText: Support Ukraine 🇺🇦
      supportUrl: https://donate.chooselove.org/campaigns/ukraine-appeal/
```

**Properties:**

| Property      | Type      | Description                                    |
| ------------- | --------- | ---------------------------------------------- |
| `enabled`     | `boolean` | Whether or not to show the banner.             |
| `supportText` | `string`  | The text to show on the banner.                |
| `supportUrl`  | `string`  | The URL to link to when the banner is clicked. |
