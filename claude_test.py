#!/usr/bin/env python3

from anthropic import Anthropic

client = Anthropic(
    base_url="http://127.0.0.1:8045", api_key="sk-18fb9b5dadcb457787514bc14530212f"
)

response = client.messages.create(
    model="claude-opus-4-5-thinking",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.content[0].text)
