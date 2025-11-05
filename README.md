## Endpoints

### 1) Create + stream QR (PNG)

**Path style**  
`GET /api/create/<API_KEY>&<AMOUNT>`

**Query style (same)**  
`GET /api/create?api_key=<API_KEY>&amount=<AMOUNT>`

Optional: `&format=json` returns a JSON descriptor instead of streaming PNG.

- Returns the PNG with `Content-Disposition: inline; filename="<link_id>.png"`

### 2) Check status

`GET /api/check/<link_id>`  
or `GET /api/check/<link_id>.png` (the `.png` is ignored)

## Deploy on Vercel

```bash
pnpm i    # or npm i / yarn
pnpm dev  # run locally
pnpm build && pnpm start  # production
# push to GitHub and import in Vercel
```

No environment variables are required.

---
