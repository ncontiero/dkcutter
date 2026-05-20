# {{ dkcutter.projectSlug }}

Word count: {{ dkcutter.projectSlug | wordCount }}
Framework: {{ dkcutter.framework }}
{%- if dkcutter.tools != "none" %}
Tools: {% for tool in dkcutter.tools %}{{tool}}{% if not loop.last %}, {% endif %}{% endfor %}
{%- endif %}
