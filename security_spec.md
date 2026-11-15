# ReelHouse Firestore Security Specification

## 1. Data Invariants
1. **Watchlist Ownership Invariant**: A watchlist item at `/users/{userId}/watchlist/{movieId}` can only be read, listed, created, updated, or deleted when `request.auth != null`, `userId == request.auth.uid`, and `data.userId == request.auth.uid`.
2. **Watchlist Referential & Key Integrity**: Document `{movieId}` in the path must strictly match `data.movieId`, `addedAt` is immutable after creation (`incoming().addedAt == existing().addedAt`), and timestamps must equal `request.time`.
3. **One Rating Per User Per Film**: Every document in `/ratings/{ratingId}` must use the deterministic key `ratingId == data.userId + '_' + data.movieId`.
4. **Verified Reviewer & Score Bounds**: Creating, updating, or deleting a rating requires `request.auth.token.email_verified == true`. `score` must be an integer between `1` and `5`. `review` is capped at `600` characters.
5. **PII Isolation**: Neither `/users/{userId}/watchlist/{movieId}` nor `/ratings/{ratingId}` stores email addresses, phone numbers, or street addresses.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Watchlist Read**: Unauthenticated `GET /users/uid1/watchlist/m1`.
2. **Cross-User Watchlist Read**: User A (`uidA`) attempts `LIST /users/uidB/watchlist`.
3. **Spoofed Watchlist Owner**: User A attempts `CREATE /users/uidA/watchlist/m1` with `userId: "uidB"`.
4. **Shadow Field Injection on Watchlist**: User A creates watchlist item with extra key `isAdmin: true`.
5. **Backdated Timestamp on Watchlist**: User A creates watchlist item with `addedAt` set to a client-chosen past timestamp instead of `request.time`.
6. **Immutable Field Tampering on Watchlist Update**: User A updates `addedAt` or `movieId` on an existing watchlist item.
7. **ID Poisoning**: Creating `/users/uidA/watchlist/invalid$id!with*badchars` or oversized 200-char ID.
8. **Duplicate/Arbitrary Rating ID**: User A attempts `CREATE /ratings/custom_id` where `ratingId != uidA + '_' + movieId`.
9. **Unverified Email Rating Write**: Signed-in user with `email_verified: false` attempts `CREATE /ratings/uidA_m1`.
10. **Out-of-Bounds Rating Score**: User A attempts `CREATE /ratings/uidA_m1` with `score: 99` or `score: "five"`.
11. **Oversized Review Payload (Denial of Wallet)**: User A submits `review` with `601+` characters.
12. **Cross-User Rating Hijack**: User B attempts `UPDATE` or `DELETE` on `/ratings/uidA_m1`.
