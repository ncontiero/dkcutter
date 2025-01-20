# Create a DKCutter From Scratch

In this tutorial, we are creating _dkcutter-website-simple_, a dkcutter for generating simple, bare-bones websites

## Step 1: Name Your DKCutter

Create the directory for your dkcutter and cd into it:

```bash
mkdir dkcutter-website-simple
cd dkcutter-website-simple/
```

## Step 2: Create `dkcutter.json`

`dkcutter.json` is a JSON file that contains fields which can be referenced in the dkcutter template. For each, default value is defined and user will be prompted for input during dkcutter execution.

```json
{
  "$schema": "https://github.com/dkshs/dkcutter/raw/refs/heads/main/dkcutter-schema.json",
  "projectName": "DKCutter Website Simple",
  "projectSlug": "{{ projectName|lower|replace(' ', '-')|trim }}"
}
```

## Step 3: Create `template/projectSlug` Directory

Create a directory called `template/{{dkcutter.projectSlug}}`.

This value will be replaced with the repo name of projects that you generate from this dkcutter.

## Step 4: Create `index.html`

Inside of `template/{{dkcutter.projectSlug}}`, create `index.html` with following content:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>{{ dkcutter.projectName }}</title>
  </head>
  <body>
    <h1>{{ dkcutter.projectName }}</h1>
  </body>
</html>
```

## Step 5: Run dkcutter

Run the following command in the directory that contains the `template` folder and `dkcutter.json`:

```bash
npx dkcutter@latest .
```

You can expect similar output:

```bash
npx dkcutter@latest .
✔ Project name? … Test web
✔ Project slug? … test-web
✔ Project created!
```

Resulting directory should be inside your work directory with a name that matches `projectSlug` you defined. Inside that directory there should be `index.html` with generated source:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Test web</title>
  </head>
  <body>
    <h1>Test web</h1>
  </body>
</html>
```
