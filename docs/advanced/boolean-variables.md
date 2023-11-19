# Boolean Variables

Boolean variables are used for answering True/False questions.

## Basic Usage

The variables of choice should be an [`boolean`](./user_config.md#boolean) or [`object`](./user_config.md#object).

For example, if you provide the following choice variable in your `dkcutter.json`:

```json
{
  "runInstall": true
}
```

you will get the following user input when running DKCutter:

```bash
? Run install? › No / Yes
```

The above `runInstall` boolean variable creates `runInstall`, which can be used like this:

```js
{%- if runInstall -%}
//  In case of True add your content here

{%- else -%}
// In case of False add your content here

{% endif %}
```

DKCutter is using the [nunjucks if conditional expression](https://mozilla.github.io/nunjucks/templating.html#if) to determine the correct `runInstall`.
