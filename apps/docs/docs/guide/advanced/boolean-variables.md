# Boolean Variables

Boolean variables are a fundamental building block for creating interactive project generation experiences with DKCutter. They allow you to present users with yes-or-no questions, enabling you to tailor project setups based on their preferences.

## Defining Boolean Variables

Boolean variables are defined within your `dkcutter.json` configuration file and can be either simple `boolean` values (true or false) or objects with specific properties.

### Example: Running Installation

Consider the following `dkcutter.json` snippet:

```json title="dkcutter.json"
{
  "runInstall": true
}
```

In this example:

- `"runInstall"` is the name of the boolean variable.
- The value `true` indicates that the installation process should be run by default.

When the user encounters this variable during project generation, they'll see a prompt:

```bash
? Run install? › No / Yes
```

The user can confirm (No / Yes) to proceed with the installation or choose not to (No).

## Using Boolean Variables in Templates

Once the user makes a selection, the chosen value becomes accessible within your project templates as `dkcutter.runInstall`. You can leverage this value with conditional statements to control the flow of your templates.

### Example: Conditional Installation Script

Here's how you might use the `dkcutter.runInstall` variable in a template:

```bash
# Inside a script section of your template
{% if dkcutter.runInstall %}
  # Installation commands go here
  npm install
{% endif %}
```

This example utilizes a Nunjucks conditional statement (`{% if...%}`) to check the value of `dkcutter.runInstall`. If it's `true` (user confirmed installation), the installation commands within the block will be executed.

## Additional Considerations

- While `true` and `false` are the most common values, boolean variables defined as [objects](./variables-using-object.md) can provide more flexibility. Refer to the DKCutter documentation for details on object-based boolean variables.
- Combine boolean variables with other DKCutter features like [choice variables](./choice-variables.md) and templates to create even more interactive and user-friendly project generation experiences.

By effectively using boolean variables, you can streamline your project generation process and cater to user preferences during DKCutter project creation.
