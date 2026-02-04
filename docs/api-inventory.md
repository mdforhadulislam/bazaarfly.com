# API Inventory (Next.js app routes)

This list is derived from `src/app/api/**/route.ts` route handlers.

## Account
- `/api/account` — `GET`, `PUT`, `DELETE`, `PATCH`
- `/api/account/[phone]/profile` — `GET`, `PUT`, `POST`
- `/api/account/[phone]/address` — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `/api/account/[phone]/notification` — `GET`, `PATCH`, `DELETE`
- `/api/account/[phone]/order` — `GET`, `POST`, `DELETE`
- `/api/account/[phone]/order/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`
- `/api/account/[phone]/order/[id]/pyment` — `GET`, `POST`
- `/api/account/[phone]/payment` — `GET`, `POST`, `DELETE`
- `/api/account/[phone]/payment/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`

## Affiliate
- `/api/affiliate` — `GET`
- `/api/affiliate/[affiliatecode]/profile` — `GET`, `PUT`
- `/api/affiliate/[affiliatecode]/link` — `GET`, `POST`
- `/api/affiliate/[affiliatecode]/link/[id]` — `GET`, `PATCH`, `DELETE`
- `/api/affiliate/[affiliatecode]/conversions` — `GET`
- `/api/affiliate/[affiliatecode]/conversions/[id]` — `GET`, `PATCH`, `DELETE`
- `/api/affiliate/[affiliatecode]/commissions` — `GET`
- `/api/affiliate/[affiliatecode]/commissions/[id]` — `GET`, `PATCH`, `DELETE`
- `/api/affiliate/[affiliatecode]/wallet` — `GET`
- `/api/affiliate/[affiliatecode]/wallet/[id]` — `GET`, `PATCH`

## Analytics
- `/api/analytics/daily` — `GET`
- `/api/analytics/performance` — `GET`
- `/api/analytics/traffic` — `GET`

## Auth
- `/api/auth/signup` — `POST`
- `/api/auth/signin` — `POST`
- `/api/auth/verify-email` — `POST`
- `/api/auth/refresh-token` — `POST`
- `/api/auth/forgot-password` — `POST`
- `/api/auth/reset-password` — `POST`
- `/api/auth/affiliate` — `POST`

## Catalog (Category / Tag / Product)
- `/api/category` — `GET`, `POST`, `DELETE`
- `/api/category/[slug]` — `GET`, `PUT`, `PATCH`, `DELETE`
- `/api/category/[slug]/product` — `GET`, `POST`
- `/api/tag` — `GET`, `POST`
- `/api/tag/[slug]` — `GET`, `PUT`, `DELETE`
- `/api/tag/[slug]/product` — `GET`
- `/api/product` — `GET`, `POST`
- `/api/product/[slug]` — `GET`, `PUT`, `PATCH`, `DELETE`

## Order & Payment
- `/api/order` — `GET`, `POST`
- `/api/order/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`
- `/api/order/[id]/payment` — `POST`, `PUT`, `PATCH`
- `/api/payment` — `GET`, `POST`
- `/api/payment/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`

## Content (Banner / Popup)
- `/api/banner` — `GET`, `POST`
- `/api/banner/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`
- `/api/popup` — `GET`, `POST`
- `/api/popup/[id]` — `GET`, `PUT`, `PATCH`, `DELETE`

## Contact
- `/api/contact` — `POST`, `GET`
- `/api/contact/[id]` — `GET`, `PATCH`, `DELETE`

## Commands used to compile this list
- `rg "api" -n src`
- `find src/app/api -type f -name "route.ts"`
- `rg "export async function" -n src/app/api`
- `python - <<'PY' ... PY`
