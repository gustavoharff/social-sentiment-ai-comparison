<p align="center">
  <img src="./.github/icon.svg" width="80" />
</p>

<h1 align="center">
  Vizo
</h1>

Comparing Sentiment Analysis Models: Azure vs. AWS vs. Google.


```ts
import { LanguageServiceClient } from '@google-cloud/language'

const client = new LanguageServiceClient()

const [result] = await client.analyzeSentiment({
  document: {
    content: c.message,
    type: 'PLAIN_TEXT',
    language: 'pt',
  },
})

console.log(result.documentSentiment.score)
console.log(result.documentSentiment.magnitude)
```

```ts
import { Comprehend } from 'aws-sdk'

const comprehend = new Comprehend({
  region: 'us-east-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
})

const analysis = await comprehend
    .detectSentiment({ LanguageCode: 'pt', Text: c.message })
    .promise()

// POSITIVE, NEGATIVE, NEUTRAL, MIXED
console.log(analysis.Sentiment)
```

```ts
const { score, magnitude } = result.documentSentiment

if (score >= 0.5 && magnitude >= 1.5) {
  return 'positive'
} else if (score <= 0 && magnitude >= 0.5) {
  return 'negative'
} else if (score >= 0 && score <= 0.1 && magnitude < 1.5) {
  return 'neutral'
} else if (score >= -0.1 && score <= 0.1 && magnitude >= 1.5) {
  return 'mixed'
} else {
  return 'neutral'
}
```