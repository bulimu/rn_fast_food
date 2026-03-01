# Skills: React Native / Expo SDK Migration & New Architecture Compatibility

## Core Competency
Migrating production React Native (Expo) applications from Legacy Architecture (Bridge)
to New Architecture (Fabric + JSI), including diagnosing and resolving cross-library
compatibility issues introduced by the architectural shift.

---

## Technical Skills Demonstrated

### 1. Expo & React Native Ecosystem
- Performed full Expo SDK 53 → 54 upgrade including `package.json`, `app.json`,
  `metro.config.js`, `tsconfig.json`, `babel.config.js`, `nativewind-env.d.ts`
- Resolved peer dependency conflicts across 17+ packages using `expo-doctor`
- Enabled New Architecture (`newArchEnabled: true`) and validated via
  `expo-doctor` (17/17 checks passing)

### 2. New Architecture (Fabric) Debugging
- Diagnosed `NativeViewGestureHandler` crash caused by incorrect
  `GestureHandlerRootView` placement and stale bridge-based library APIs
- Identified and removed `react-native-raw-bottom-sheet` (incompatible with
  Fabric); replaced with `Modal` from `react-native`
- Removed manual `import 'react-native-gesture-handler'` side-effect imports
  that conflict with Expo Router's automatic registration
- Re-routed `FlatList` / `ScrollView` imports from
  `react-native-gesture-handler` → `react-native`

### 3. Image & Styling (NativeWind v4 + Fabric)
- Migrated all `tintColor` usages from prop / Tailwind `className` to
  `style` object to comply with RN 0.81 Fabric rendering model
- Resolved intermittent icon disappearance in `FlatList` recycled cells by
  replacing conditional `{flag && <Image />}` mounting with `opacity`
  toggling — avoiding stale native node references on Fabric

### 4. State Management & Data Fetching
- **Zustand**: `cart.store.ts`, `auth.store.ts` — persisted cart state,
  session management
- **TanStack React Query v5**: `useQuery`, `useMutation`,
  `useInfiniteQuery`, `useQueryClient` — cursor-based pagination with
  Appwrite `Query.cursorAfter`, cache invalidation strategies
- Converted bulk-fetch queries to infinite scroll (`useInfiniteQuery`)
  with `onEndReached` + `onEndReachedThreshold` for virtualized lists

### 5. Appwrite (BaaS)
- Database queries: `listDocuments`, `getDocument`, `createDocument`,
  `updateDocument`, `deleteDocument` with compound query builders
- Cloud Functions: authored and deployed Node.js functions
  (`create-payment-intent`, `upload-avatar`) using `node-appwrite` SDK,
  environment variables, and `appwrite push function` CLI
- Storage: avatar upload pipeline via cloud function with bucket permissions
- Auth: email/password, session management, JWT

### 6. Stripe Payments (React Native)
- Integrated `@stripe/stripe-react-native@0.50.3` with `StripeProvider`
- Full payment flow: `createPaymentIntent` (cloud function) →
  `initPaymentSheet` → `presentPaymentSheet`
- Implemented `PaymentSheet` component with order creation, cart clearing,
  and success modal on confirmed payment

### 7. UI Architecture
- Built screen-level components using **inline styles + NativeWind v4**
  pattern for Fabric compatibility
- Consistent design system: orange `#FE8C00` primary, `#f8f8f8` background,
  `borderRadius: 16-18`, `elevation: 2-3` card shadows
- Components: `DeliveryPicker`, `OrderCard`, `CartItem`, `PaymentSheet`,
  `CustomizationOption`, `QuantitySelector`, `SearchBar`, `Filter`
- Expo Router v4 file-based navigation with typed routes

---

## Stack

| Category     | Technologies                                          |
|--------------|-------------------------------------------------------|
| Framework    | Expo SDK 54, React Native 0.81.5, React 19.1.0        |
| Navigation   | Expo Router v4 (file-based, typed)                    |
| Styling      | NativeWind v4, Tailwind CSS                           |
| State        | Zustand, TanStack React Query v5                      |
| Backend      | Appwrite (Auth, Database, Storage, Functions)         |
| Payments     | Stripe (`@stripe/stripe-react-native`)                |
| Language     | TypeScript                                            |
| Architecture | React Native New Architecture (Fabric + JSI)          |
