# Usage

Pull repo, create .env file (example in .env-example) with environment variables. Then:
```bash
npm install
node seotest.js http://testsite.com [enabled-rules, ...]
```

# Current tests
* alt in img tag
* title in links
* check for only one h1
* PageSpeed Insights (you must provide Page Speed API key)
