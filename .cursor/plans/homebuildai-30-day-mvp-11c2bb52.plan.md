<!-- 11c2bb52-0314-455e-a356-bb18f26007ef d43fd6b5-446a-40df-9eb4-8ed7e0f32c1c -->
# HomeBuildAI - 30 Day Production-Ready Roadmap

## Project Context

**Current State**: Lovable-generated MVP with solid architecture but critical bugs and missing integrations

**Goal**: Secure, stable platform ready for real supplier and user testing

**Constraints**: Solo developer, 2 hrs/day after work, €500 AI API budget

**Key Files**:

- `src/integrations/supabase/client.ts` - Supabase connection
- `supabase/functions/verify-otp-and-send-pdf/index.ts` - Email bug location
- `supabase/functions/generate-pdf/index.ts` - PDF generation (currently HTML only)
- `src/pages/Capitolato.tsx` - Main results page (550 lines, well-structured)
- Database schema: `src/integrations/supabase/types.ts` (26 tables, production-ready)

---

## WEEK 1: Critical Foundations (Days 1-7, 14 hours)

### Day 1-2: Security Lockdown (4 hours)

**Critical vulnerabilities to fix**:

1. **Add .env to gitignore**

   - Add `.env`, `.env.local`, `.env.production` to `.gitignore`
   - Verify with `git status` that .env is now ignored
   - Create `.env.example` template without sensitive values

2. **Rotate Supabase credentials**

   - Login to Supabase dashboard (https://wncvvncldryfqqvpmnor.supabase.co)
   - Generate new anon/public key
   - Update VITE_SUPABASE_PUBLISHABLE_KEY in `.env`
   - Update hardcoded values in `src/integrations/supabase/client.ts` to use `import.meta.env.VITE_SUPABASE_URL`

3. **Enable JWT verification on Edge Functions**

   - Edit `supabase/config.toml`
   - Change `verify_jwt = false` to `verify_jwt = true` for:
     - `ai-interview`, `ai-interview-v2`
     - `generate-pdf`
     - `signup-supplier`
   - Keep `get-system-setting` as false (public read-only)
   - Deploy: `supabase functions deploy`

4. **Remove console.log statements**

   - Search and remove 18 console.log calls in:
     - `src/components/ProtectedRoute.tsx` (13 instances)
     - `src/hooks/useAuth.ts` (2 instances)
     - `src/pages/SupplierAuth.tsx`, `ContactVerification.tsx`, `Capitolato.tsx`
   - Replace with conditional dev-only logging: `if (import.meta.env.DEV) console.log(...)`

5. **Add error boundaries**

   - Create `src/components/ErrorBoundary.tsx`
   - Wrap `<App />` in `main.tsx`

### Day 3-4: Fix PDF Generation (4 hours)

**Current issue**: `generate-pdf` function creates HTML files, not PDFs

1. **Choose PDF generation strategy**

   - Option A: Use Deno-compatible PDF library (recommended: `jsPDF` or `pdfmake`)
   - Option B: Use Supabase Edge Function with Chrome headless (puppeteer)
   - Decision: Use jsPDF (lighter, faster, cheaper)

2. **Implement PDF generation**

   - Update `supabase/functions/generate-pdf/index.ts`:
     - Import jsPDF library for Deno
     - Convert HTML template to PDF using jsPDF
     - Upload as actual PDF (not .html)
   - Test PDF output quality with real capitolato data

3. **Add retry logic for PDF failures**

   - Wrap PDF generation in try-catch with 3 retries
   - Log errors to Supabase table `pdf_generation_logs`

### Day 5-7: Fix Postmark Email Bug (6 hours)

**Root cause identified**: Email sent before PDF completes (race condition at line 219-232 of `verify-otp-and-send-pdf/index.ts`)

1. **Implement async queue with proper await**
   ```typescript
   // Line 217-232 refactor:
   // 1. Wait for PDF generation to complete (add proper await)
   // 2. Fetch the actual PDF file as base64
   // 3. Attach base64 to Postmark email
   // 4. Send email only after PDF is confirmed uploaded
   ```

2. **Fix Postmark attachment code**

   - Lines 28-37 in `verify-otp-and-send-pdf/index.ts`
   - Fetch PDF from Supabase Storage
   - Convert to base64
   - Add to `emailData.Attachments` array:
     ```typescript
     Attachments: [{
       Name: 'Capitolato_BuildHomeAI.pdf',
       ContentType: 'application/pdf',
       Content: base64PdfContent // Not URL!
     }]
     ```


3. **Add delayed trigger for safety**

   - Add 2-second delay after PDF URL is saved to DB
   - Verify PDF is accessible before sending email
   - Add fallback: if attachment fails, send email with download link only

4. **Test complete flow**

   - Upload → Interview → OTP → PDF → Email with attachment
   - Verify PDF opens correctly from email
   - Test with different lead sizes (1-10 sections)

**Deliverable Week 1**: Secure app + working PDF email flow

---

## WEEK 2: Core Lead Flow (Days 8-14, 14 hours)

### Day 8-9: Lead Data Mapping Verification (4 hours)

1. **Audit interview → database mapping**

   - Review `src/pages/Interview.tsx` (333 lines)
   - Trace data flow: AI response → `leads` table
   - Verify all fields populate:
     - `interview_data` (JSON)
     - `cap`, `citta`, `regione` (extracted from location)
     - `renovation_scope`, `target_rooms`
     - `capitolato_data` (AI-generated)
     - `cost_estimate_min/max`, `confidence`

2. **Add validation and error handling**

   - Validate required fields before saving lead
   - Add Zod schemas for interview data structure
   - Show user-friendly errors if data incomplete

3. **Test edge cases**

   - Missing location data
   - Invalid CAP codes
   - Interview incomplete/abandoned

### Day 10-11: Supplier Geographic Matching (4 hours)

**Database has ready function**: `auto_assign_lead_to_suppliers(lead_uuid)`

1. **Wire up auto-assignment after OTP verification**

   - In `verify-otp-and-send-pdf/index.ts` after line 214:
   ```typescript
   // After status updated to 'queued'
   const { data: assignedCount } = await supabase.rpc('auto_assign_lead_to_suppliers', {
     lead_uuid: leadId
   });
   console.log(`Lead assigned to ${assignedCount} suppliers`);
   ```


2. **Test CAP → Region matching**

   - Review `auto_assign_lead_to_suppliers` function logic
   - Test with leads from different regions:
     - Lombardia (Milan: 20100)
     - Lazio (Rome: 00100)
     - Sicilia (Palermo: 90100)
   - Verify correct suppliers get records in `supplier_leads` table

3. **Add assignment status tracking**

   - Update `leads.current_assignments` count
   - Set `leads.assignment_type` ('shared' vs 'exclusive')
   - Add `max_assignments` limit (default: 5 suppliers)

### Day 12-14: Twilio Integration (6 hours)

1. **Set up Twilio account and credentials**

   - Create Twilio account
   - Get Account SID, Auth Token, Phone Number
   - Add to `system_settings` table via Admin UI

2. **Create SMS notification Edge Function**

   - New function: `supabase/functions/send-supplier-sms/index.ts`
   - Triggered when supplier_leads record created
   - SMS template: "Nuovo progetto disponibile in [città]: €[range]. Accedi a HomeBuildAI per dettagli."

3. **Update supplier notification logic**

   - After `auto_assign_lead_to_suppliers` runs:
     - Send Postmark email to each assigned supplier
     - Send Twilio SMS as backup
   - Track notifications in `supplier_leads` table

4. **Test multi-channel notifications**

   - Verify suppliers receive both email and SMS
   - Test opt-out scenarios
   - Add rate limiting (max 10 SMS/hour per supplier)

**Deliverable Week 2**: Complete lead pipeline from user → matched suppliers with notifications

---

## WEEK 3: Dashboards & Payments (Days 15-21, 14 hours)

### Day 15-16: Supplier Dashboard (4 hours)

1. **Wire up SupplierDashboard to real data**

   - Fetch from `supplier_leads` table where `supplier_id = current_user`
   - Show leads with status: 'offered', 'purchased', 'expired'
   - Display blurred preview for 'offered' leads:
     - Project type (ristrutturazione completa, etc.)
     - Location (città, regione) - shown
     - Cost estimate range
     - Days until expiration

2. **Add purchase flow UI**

   - "Acquista Lead" button on each offered lead
   - Shows price (from `supplier_leads.price`)
   - Clicking triggers Stripe checkout

3. **Add lead filtering and sorting**

   - Filter by status, location, price range
   - Sort by newest, expiring soon, highest value

### Day 17-19: Stripe Integration - SIMPLIFIED (6 hours)

**Note**: User will create Stripe test account by Week 3

1. **Set up Stripe test account** (User task)

   - Create account at https://dashboard.stripe.com/test
   - Get test API keys (pk_test and sk_test)
   - Add to `system_settings` table via AdminApiManager

2. **Create Stripe checkout Edge Function**

   - New: `supabase/functions/create-stripe-checkout/index.ts`
   - Input: `supplier_lead_id`
   - Creates Stripe Checkout Session (one-time payment)
   - Returns checkout URL

3. **Implement purchase flow**

   - Supplier clicks "Acquista Lead"
   - Frontend calls `create-stripe-checkout` function
   - Redirects to Stripe Checkout page
   - Success redirect: `/fornitori/dashboard?payment=success`

4. **Handle Stripe webhooks**

   - New: `supabase/functions/stripe-webhook/index.ts`
   - Listen for `checkout.session.completed`
   - Update `supplier_leads.status` to 'purchased'
   - Create record in `supplier_payments` table
   - Reveal full lead data (remove blur)

5. **Test payment flow end-to-end**

   - Use Stripe test cards (4242 4242 4242 4242)
   - Verify payment records in database
   - Confirm lead data unlocked for supplier

### Day 20-21: Admin Dashboard Improvements (4 hours)

1. **Connect AdminLeadsTable to real data**

   - Fetch all leads with stats
   - Show status, assignment count, revenue
   - Add filters: status, region, date range

2. **Add lead management actions**

   - Manual status change (new → queued → assigned → closed)
   - Re-assign lead to different suppliers
   - Mark as spam/invalid
   - Export to CSV

3. **Implement basic pricing rules**

   - AdminPricingRules component:
     - Default price per lead: €50
     - Regional multipliers (Milan: 1.3x, Rome: 1.2x, etc.)
     - Exclusive lead: 2x price
   - Save to `system_settings` table
   - Simple UI: region dropdown + multiplier input

**Deliverable Week 3**: Fully functional purchase flow with Stripe + basic admin controls

---

## WEEK 4: Polish & AI Trainer (Days 22-30, 18 hours)

### Day 22-24: AI Trainer Persistence (6 hours)

**Current state**: UI exists in `src/pages/AITrainer.tsx` but no backend wiring

1. **Connect InterviewPromptTab to database**

   - Create `src/components/ai-trainer/InterviewPromptTab.tsx` (if not exists)
   - CRUD operations on `ai_prompts` table:
     - Read: fetch active prompts by `kind` (system, interview, capitolato)
     - Update: save prompt `content`
     - Version control: increment `version` on each save
   - UI: Textarea for each prompt type + Save button

2. **Connect KnowledgeBaseTab to database**

   - CRUD operations on `kb_docs` table:
     - List all documents with tags
     - Add new document (title, content, tags)
     - Edit existing documents
     - Delete (soft delete with `updated_at`)
   - Search functionality (simple text match on `content_text`)

3. **Connect PriceCalibrationTab to regional pricelists**

   - Read from `regional_pricelists` and `price_items` tables
   - Display current active pricelists by region
   - Allow upload of new pricelist CSV
   - Parse and save to `price_items` table
   - Use existing Edge Function: `parse-regional-pricelist`

4. **Test AI Trainer persistence**

   - Save prompt → reload page → verify it persists
   - Add KB doc → verify appears in list
   - Upload pricelist → verify items in database

### Day 25-26: Lead Assignment Rules - SIMPLE (4 hours)

1. **Implement first-come-first-served by default**

   - Modify `auto_assign_lead_to_suppliers` if needed
   - Suppliers ranked by `created_at` in their region
   - First 5 get the lead (configurable via `leads.max_assignments`)

2. **Add admin controls for assignment**

   - In AdminConsole: set assignment type per lead
   - Options: 'shared' (multiple suppliers), 'exclusive' (first to pay wins)
   - Update pricing: exclusive = 2x base price

3. **Implement auto-expiry**

   - Add database trigger or scheduled job
   - After 7 days, update `supplier_leads.status` to 'expired'
   - Send notification to suppliers with last chance

### Day 27-28: Demo Mode with Realistic Italian Data (4 hours)

**Priority: Most important if time is tight**

1. **Create realistic Italian renovation demo data**

   - 10 sample leads with:
     - Real Italian cities (Milano, Roma, Napoli, Torino, Firenze, etc.)
     - Realistic CAP codes matching regions
     - Italian names and addresses
     - Typical renovation types (ristrutturazione bagno, cucina, completa)
     - Cost estimates: €15,000 - €150,000 range
     - Complete capitolato with Italian construction terms

2. **Seed demo supplier accounts**

   - 5 demo suppliers covering different regions:
     - "Edil Milano SRL" (Lombardia)
     - "Roma Costruzioni" (Lazio)
     - "Napoli Ristrutturazioni" (Campania)
     - "Impresa Torinese" (Piemonte)
     - "Artigiani Fiorentini" (Toscana)
   - Each with realistic company details (VAT, phone, email)

3. **Create demo mode toggle**

   - Admin can enable "Demo Mode" in settings
   - Shows demo banner on all pages
   - Demo leads clearly labeled
   - Cannot actually charge cards in demo mode (test mode only)

4. **Create demo walkthrough script**

   - Step-by-step guide for testing:

     1. User creates lead
     2. Receives PDF via email
     3. Suppliers notified
     4. Supplier logs in, sees blurred lead
     5. Purchases lead (test card)
     6. Full data revealed

   - Document in `/docs/demo-walkthrough.md`

### Day 29-30: Final Testing & Bug Fixes (4 hours)

1. **End-to-end testing**

   - User flow: Upload → Interview → OTP → PDF → Email ✓
   - Supplier flow: Notification → Login → View → Purchase → Access ✓
   - Admin flow: View leads → Manage → Set pricing → AI Trainer ✓
   - Test on desktop + mobile browsers

2. **Critical bug fixes**

   - Address any blockers found in testing
   - Fix UI responsiveness issues
   - Handle edge cases (missing data, network errors)

3. **Performance optimization**

   - Check slow queries in Supabase dashboard
   - Add indexes if needed (leads: regione, status; supplier_leads: supplier_id, status)
   - Optimize images (compress logo files)

4. **Deploy to staging**

   - Create staging environment in Supabase
   - Deploy all Edge Functions
   - Update environment variables
   - Run smoke tests

**Deliverable Week 4**: Production-ready MVP with demo mode for real-world testing

---

## Success Criteria

By Day 30, the platform must have:

✅ **Security**: No exposed credentials, JWT verification enabled, RLS policies active

✅ **Core Flow**: User upload → AI interview → Capitolato PDF → Email working 100%

✅ **Supplier Matching**: Auto-assignment by region, SMS + email notifications

✅ **Payments**: Stripe integration, lead purchase working with test cards

✅ **Admin Tools**: Lead management, basic pricing rules, AI Trainer CRUD

✅ **Demo Mode**: Realistic Italian data, full walkthrough ready for testing

---

## Out of Scope (Deferred to Phase 2)

The following are intentionally cut to meet 30-day deadline:

- ❌ Auction system for leads (too complex, use first-come-first-served)
- ❌ Subscription payments (one-time purchases only)
- ❌ Advanced AI training with embeddings (just CRUD on prompts/KB)
- ❌ WhatsApp Business API (SMS via Twilio sufficient)
- ❌ Dynamic pricing algorithms (manual multipliers only)
- ❌ Full UX redesign (keep current Lovable design)
- ❌ Comprehensive test suite (manual testing only)
- ❌ Advanced analytics dashboard (basic stats sufficient)
- ❌ Multi-language support (Italian only)
- ❌ Mobile app (PWA sufficient)

---

## Risk Mitigation

**If falling behind schedule**:

1. **Priority 1** (Must have): Security + PDF/Email fix + Stripe payment
2. **Priority 2** (Should have): Supplier notifications + Demo mode
3. **Priority 3** (Nice to have): AI Trainer + Admin improvements

**If ahead of schedule**:

- Add automated tests for critical flows
- Improve error messages and user feedback
- Polish UI/UX of supplier dashboard
- Add more demo scenarios

**Technical risks**:

- PDF generation complexity → Mitigation: Use simple jsPDF, not complex rendering
- Stripe webhook delays → Mitigation: Add manual "check payment" button
- Twilio SMS costs → Mitigation: Rate limit to 10/hour, email as primary

---

## Daily Workflow Recommendation

**First 30 minutes**: Review plan, set daily goal

**Next 60 minutes**: Focused coding (no distractions)

**Last 30 minutes**: Test, commit, document progress

**Weekend boost**: If available, use Saturdays for 4-hour coding sessions to build buffer time

**Communication**: Update progress after each week milestone - we adjust plan if needed

---

## Next Steps

**Immediate**: Await your explicit command to begin execution

**Before Week 3**: Create Stripe test account and add API keys

**After Week 4**: Schedule user testing with real suppliers

Ready to proceed when you give the command! 

### To-dos

- [ ] Security lockdown: gitignore .env, rotate credentials, enable JWT verification, remove console.logs, add error boundaries
- [ ] Fix PDF generation: implement jsPDF library, convert HTML to actual PDF, add retry logic
- [ ] Fix Postmark email bug: implement async queue, add base64 PDF attachment, add delayed trigger, test complete flow
- [ ] Verify lead data mapping: audit interview to database flow, add validation with Zod, test edge cases
- [ ] Implement supplier geographic matching: wire up auto_assign_lead_to_suppliers function, test CAP to region matching
- [ ] Integrate Twilio: set up SMS notifications, create send-supplier-sms function, implement multi-channel notifications
- [ ] Build supplier dashboard: wire up to real data, show blurred lead previews, add purchase flow UI
- [ ] Integrate Stripe payments: create checkout function, implement purchase flow, handle webhooks, test with test cards
- [ ] Improve admin dashboard: connect AdminLeadsTable to data, add management actions, implement basic pricing rules
- [ ] Implement AI Trainer persistence: connect InterviewPromptTab, KnowledgeBaseTab, and PriceCalibrationTab to database
- [ ] Implement lead assignment rules: first-come-first-served, admin controls, auto-expiry after 7 days
- [ ] Create demo mode: generate realistic Italian renovation data, seed demo suppliers, add demo toggle, create walkthrough
- [ ] Final testing and deployment: end-to-end testing, critical bug fixes, performance optimization, deploy to staging