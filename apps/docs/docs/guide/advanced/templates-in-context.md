# Templates in Context Values

DKCutter provides powerful templating capabilities within the *values* (not the keys) of your `dkcutter.json` configuration file. This allows you to dynamically generate values based on user input, creating more intelligent and user-friendly project setups. By leveraging [Nunjucks templating](https://mozilla.github.io/nunjucks/templating.html), you can derive context values from previously answered prompts, significantly reducing repetitive user input and providing more sensible defaults.

## How it Works

When DKCutter processes your `dkcutter.json` file, it treats the values as Nunjucks templates. As the user responds to prompts, those answers are immediately added to the template context. This means subsequent values can reference and transform earlier responses.

## Basic Example: Dynamically Generating a Project Slug

Consider this `dkcutter.json` snippet:

```json title="dkcutter.json"
{
  "projectName": "My New Project",
  "projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

Here's how this works in practice:

- **User Accepts Default Project Name:** If the user accepts the default `projectName` ("My New Project") or uses the `-y` or `--default` flag to skip prompts, DKCutter will evaluate the `projectSlug` template as follows:

  1. `{{ projectName }}` resolves to "My New Project".
  2. `|lower` converts the string to lowercase: "my new project".
  3. `|replace(' ', '-')` replaces spaces with hyphens: "my-new-project".
  4. `|trim` removes any leading or trailing whitespace (which isn't present in this example).

  The final value of `projectSlug` becomes `my-new-project`.

- **User Provides a Custom Project Name:** If the user enters a different project name, such as "Yet Another New Project", the same templating process occurs:

  1. `{{ projectName }}` resolves to "Yet Another New Project".
  2. `|lower` converts the string to lowercase: "yet another new project".
  3. `|replace(' ', '-')` replaces spaces with hyphens: "yet-another-new-project".
  4. `|trim` removes any leading or trailing whitespace.

  The resulting `projectSlug` is `yet-another-new-project`.

This simple example demonstrates how you can automatically generate a URL-friendly project slug based on the project name, saving the user from having to manually enter it. This approach can be extended to more complex scenarios, further enhancing the user experience and streamlining project setup.
