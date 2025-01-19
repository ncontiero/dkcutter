# Choice Variables

Choice variables provide different choices when creating a project. Depending on a user’s choice the template renders things differently.

## Basic Usage

The variables of choice should be an [`object`](./user-config.md#object) or [`array`](./user-config.md#array).

For example, if you provide the following choice variable in your `dkcutter.json`:

```json
{
  "license": {
    "promptMessage": "What license would you like to use?",
    "value": ["MIT", "BSD-3", "GNU GPL v3.0"]
  }
}
```

you’d get the following choices when running DKCutter:

```bash
? What license would you like to use? › - Space to select. Return to submit
❯   MIT
    BSD-3
    GNU GPL v3.0
```

Depending on an user’s choice, a different license is rendered by DKCutter.

The above `license` choice variable creates `license`, which can be used like this:

```md
{%- if dkcutter.license == "MIT" -%}

# Possible license content here

{%- elif dkcutter.license == "BSD-3" -%}

# More possible license content here

{% endif %}
```

DKCutter is using the [nunjucks if conditional expression](https://mozilla.github.io/nunjucks/templating.html#if) to determine the correct license.

The created choice variable is still a regular DKCutter variable and can be used like this:

```md
## License

Distributed under the terms of the `{{ dkcutter.license }}`\_ license,
```
