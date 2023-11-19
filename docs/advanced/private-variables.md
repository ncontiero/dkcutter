# Private Variables

DKCutter allows the definition private variables by prepending an underscore to the variable name. The user will not be required to fill those variables in. For example, the `dkcutter.json`:

```json
{
  "projectName": "Really cool project",
  "_private": "{{ projectName|lower }}"
}
```

Will be rendered as:

```json
{
  "projectName": "Really cool project",
  "_private": "really cool project"
}
```

The user will only be asked for `projectName`.
