# Gati Node Website — Form & Review Setup

## Email forms (contact + reviews)

Both forms send submissions to **gatinode.admin@gmail.com** via [FormSubmit](https://formsubmit.co).

### One-time activation

1. Submit either form once from your live or local site.
2. Check **gatinode.admin@gmail.com** for a FormSubmit confirmation email.
3. Click the activation link. After that, all submissions arrive in your inbox.

## Customer reviews workflow

1. Visitors submit a review on the website → you receive an email titled **"New Review Submission (Pending Approval)"**.
2. If the review is genuine, add it to `data/approved-reviews.json` (see example below).
3. Upload the updated file with your site. Only entries in that file appear on the website.

### Example approved review entry

```json
[
  {
    "name": "Rajesh Kumar",
    "designation": "Manufacturing Business, Delhi",
    "rating": 5,
    "text": "Reliable partner for our intercity freight.",
    "initials": "RK"
  }
]
```

- `initials`: 1–2 letters shown in the avatar circle (optional; generated from name if omitted).
- `rating`: number 1–5.

Keep `[]` empty until you have verified reviews to publish.
