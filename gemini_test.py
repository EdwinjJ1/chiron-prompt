#!/usr/bin/env python3

import google.generativeai as genai

genai.configure(
    api_key="sk-18fb9b5dadcb457787514bc14530212f",
    transport="rest",
    client_options={"api_endpoint": "http://127.0.0.1:8045"},
)

model = genai.GenerativeModel("gemini-3-pro-high")
response = model.generate_content("Hello")
print(response.text)
