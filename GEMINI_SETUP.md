# Getting Your Google Gemini API Key

Google Gemini offers a generous free tier that's perfect for this application.

## Step 1: Visit Google AI Studio

Go to [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 2: Sign In

Sign in with your Google account (create one if you don't have it)

## Step 3: Create API Key

1. Click on "Get API Key" or "Create API Key"
2. Select "Create API key in new project" or choose an existing project
3. Copy your API key

## Step 4: Add to Your Project

1. Open your `.env` file
2. Replace the empty `GEMINI_API_KEY` value with your key:

```env
GEMINI_API_KEY="your-actual-api-key-here"
```

## Free Tier Limits

Gemini's free tier is very generous:
- **15 requests per minute**
- **1 million tokens per minute**
- **1,500 requests per day**

This is more than enough for personal use and testing!

## Security Notes

- Keep your API key secret
- Don't commit it to version control
- Don't share it publicly
- Regenerate it if you think it's been compromised

## Pricing (Beyond Free Tier)

If you need more:
- **Gemini 1.5 Flash**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Gemini 1.5 Pro**: $1.25 per 1M input tokens, $5.00 per 1M output tokens

This is significantly cheaper than alternatives while providing excellent quality!

## Troubleshooting

### "API key not valid" error
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Verify the key is enabled in Google Cloud Console

### Rate limit errors
- Free tier: 15 requests/minute
- Wait a minute and try again
- Consider upgrading if you need higher limits

### "Model not found" error
- Gemini 1.5 Flash and Pro are available in all regions
- Check your API key has access to the Gemini API

## Documentation

For more information:
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [API Reference](https://ai.google.dev/api)
