# AI-Powered Intelligent Quoting System

## Overview

The Lawn Care Kuna website features a LawnStarter-style intelligent quoting system that provides instant, accurate price estimates with built-in 40-50% profit margins suitable for subcontracting work. The system uses OpenAI GPT-4o-mini to analyze property complexity and generate detailed pricing breakdowns.

## Features

### 4-Step Quote Wizard (`/get-quote`)

1. **Property Details**
   - Address input with auto-geocoding
   - City selection (Kuna, Boise, Meridian, Nampa, Caldwell, Eagle)
   - Interactive map-based property measurement tool
   - Property type selection (residential, commercial, HOA, property management)

2. **Service Selection**
   - Primary service selection from 40+ options
   - Add-on service selections
   - Frequency options: one-time, weekly, bi-weekly, monthly
   - Automatic frequency discounts (15% weekly, 10% bi-weekly, 5% monthly)

3. **Instant Quote**
   - AI-generated pricing with complexity analysis
   - Detailed cost breakdown (labor, materials, overhead, profit)
   - Line-item pricing for all selected services
   - Visual indicators for AI analysis vs fallback pricing

4. **Contact & Booking**
   - Contact information collection
   - Service scheduling
   - Quote submission and confirmation

### AI Property Analysis

The system uses OpenAI GPT-4o-mini to analyze:
- **Terrain difficulty**: flat, sloped, varied, steep
- **Obstacles**: trees, flowerbeds, decorative features, hardscaping
- **Grass condition**: poor, moderate, excellent
- **Accessibility**: easy, moderate, difficult

Based on this analysis, the AI generates a **complexity score** (1.0-2.0x multiplier) that adjusts base pricing to reflect actual property conditions.

### Pricing Logic

**Base Rates** (industry-standard):
- Lawn care services: $0.012-0.018 per sq ft
- Landscaping services: Project-based or linear foot pricing
- Snow removal: Per service pricing
- Christmas lights: Per linear foot

**Multipliers**:
- Property type: residential 1.0x, commercial 1.3x, HOA 1.2x, property mgmt 1.25x
- AI complexity: 1.0-2.0x based on property analysis
- Frequency discounts: weekly -15%, bi-weekly -10%, monthly -5%

**Profit Margin**: 45% markup on adjusted costs (ensures 40-50% profit margin)

**Calculation Flow**:
```
Base Cost → Property Multiplier → Complexity Multiplier → Frequency Discount → 45% Profit Margin = Final Quote
```

### Fallback Pricing

When AI analysis fails (network issues, API limits), the system automatically uses deterministic pricing:
- Uses `getInstantEstimate()` function with pre-calculated ranges
- Applies same multipliers and margins as AI path
- Sets complexity to 1.2x (moderate difficulty)
- Includes all selected add-on services
- Returns `aiFallback: true` flag in response

## Technical Architecture

### Backend Components

**`server/services/pricing.ts`**:
- `SERVICE_RATES`: Comprehensive rate table for all services
- `analyzePropertyComplexity()`: OpenAI integration for property analysis
- `calculateIntelligentQuote()`: Main AI-powered pricing engine
- `getInstantEstimate()`: Fast deterministic pricing for fallback/preview

**`server/routes.ts`**:
- `POST /api/quotes/calculate`: Quote calculation endpoint
  - Validates input with Zod schema
  - Attempts AI analysis first
  - Falls back to deterministic pricing on error
  - Returns 200 with detailed quote or 400 with field-specific errors
- `POST /api/quotes`: Quote submission endpoint
  - Stores complete quote with AI analysis
  - Handles contact info and scheduling
  - Sanitizes all numeric fields to prevent NaN storage

### Frontend Components

**`client/src/components/QuoteWizard.tsx`**:
- Multi-step form with state management
- Integration with `/api/quotes/calculate` endpoint
- Real-time quote preview
- Comprehensive error handling with toast notifications
- AI fallback indicator for transparency

**`client/src/components/MapMeasureTool.tsx`**:
- Leaflet + OpenStreetMap integration
- Polygon and rectangle drawing tools
- Real-time geodesic area calculation
- Satellite imagery with OSM overlay
- Auto-geocoding for city selection

### Database Schema

**`quotes` table** (`shared/schema.ts`):
```typescript
{
  id: varchar (UUID)
  name, email, phone, address, city, message
  serviceType, propertyType, propertySize (decimal)
  frequency, selectedServices (JSONB array)
  aiAnalysis (JSONB): terrain, obstacles, grass, accessibility, reasoning
  complexityScore: decimal (1.0-2.0)
  baseCost, adjustedCost, finalQuote: decimal
  lineItems (JSONB): service-by-service breakdown
  scheduledDate, status: pending/accepted/completed
  createdAt, updatedAt
}
```

## Error Handling

### Validation Errors (400 responses)
- Field-specific error messages using Zod
- Mapped to UI form fields for inline display
- Toast notifications for general errors

### AI Fallback (200 responses)
- Automatic fallback when OpenAI unavailable
- `aiFallback: true` flag in response
- Visual indicator shown to user
- Maintains data integrity and user experience

### Data Sanitization
- NaN guards on all numeric conversions
- String normalization for decimal fields
- Proper type coercion with Zod schemas

## Known Limitations

### 1. Linear Foot & Project-Based Services in Fallback
**Issue**: When AI analysis fails and fallback pricing is used, services with `unit: "linear_ft"` or `unit: "project"` may not price correctly if add-on services are included.

**Impact**: 
- Minor pricing inaccuracy for niche service combinations
- Most common services (lawn care, mowing, aeration) use square footage and work correctly
- Linear foot services (fence installation, gutter cleaning) should be primary service, not add-ons

**Workaround**: Users should select linear foot services as primary service rather than add-ons

**Future Fix**: Prompt users for linear footage separately when linear foot add-ons are selected

### 2. Numeric String Coercion in Nested Objects
**Issue**: The `quoteSubmissionSchema` accepts the full `quoteData` object from the API response, but nested fields in `lineItems` array may not be fully coerced if they arrive as strings.

**Impact**: 
- Extremely rare edge case
- Only occurs if API returns stringified numbers (current code returns numbers)
- Database accepts decimal strings, so storage works correctly

**Mitigation**: 
- Backend properly rounds all numeric fields to 2 decimal places
- NaN guards prevent corrupt data from reaching database
- Zod's `z.coerce.number()` handles string→number conversion at top level

**Future Fix**: Add explicit `lineItems` field coercion in submission mapper

## Testing Recommendations

### Manual Testing Checklist
1. **Basic Flow (AI Success)**
   - [ ] Enter address and property size
   - [ ] Select lawn care service
   - [ ] Verify instant quote appears
   - [ ] Check pricing breakdown is accurate
   - [ ] Submit quote and verify storage

2. **Multi-Service Quote**
   - [ ] Select primary service + 2-3 add-ons
   - [ ] Verify all services appear in line items
   - [ ] Check total equals sum of line items
   - [ ] Verify 45% margin is maintained

3. **Frequency Discounts**
   - [ ] Test one-time vs weekly pricing
   - [ ] Verify 15% discount for weekly
   - [ ] Check breakdown shows correct costs

4. **Property Types**
   - [ ] Test residential vs commercial
   - [ ] Verify 1.3x multiplier for commercial
   - [ ] Check quote reflects property type

5. **AI Fallback**
   - [ ] Temporarily disable OpenAI (remove API access)
   - [ ] Verify fallback pricing still works
   - [ ] Check "AI unavailable" indicator shows
   - [ ] Confirm quote can still be submitted

6. **Error Handling**
   - [ ] Submit with missing required fields
   - [ ] Verify field-specific error messages
   - [ ] Check toast notifications appear
   - [ ] Confirm form validation prevents submission

### Automated Testing (Future)
- E2E tests for complete quote flow
- Unit tests for pricing calculations
- Integration tests for AI analysis
- Fallback scenario testing

## Configuration

### OpenAI Integration
- Uses Replit AI Integrations (billed to credits)
- No API key management required
- Model: `gpt-4o-mini`
- Temperature: 0.3 (consistent pricing)
- Response format: JSON object

### Rate Adjustments
To modify service rates, edit `SERVICE_RATES` in `server/services/pricing.ts`:
```typescript
export const SERVICE_RATES = {
  "lawn-mowing": {
    name: "Lawn Mowing",
    baseRate: 0.015, // $/sqft for subcontractor cost
    unit: "sqft"
  },
  // ... other services
}
```

### Margin Adjustments
To change gross margin, edit `GROSS_MARGIN` (price is computed as \(cost / (1 - margin)\)):
```typescript
const GROSS_MARGIN = 0.45; // 45% gross margin
```

## Future Enhancements

1. **Admin Dashboard**
   - Quote management interface
   - Accept/decline quotes
   - Schedule management
   - Quote history and analytics

2. **Enhanced AI Analysis**
   - Satellite imagery analysis
   - Historical weather data integration
   - Seasonal pricing adjustments

3. **Customer Portal**
   - Quote status tracking
   - Service history
   - Recurring service management
   - Payment processing

4. **Advanced Pricing**
   - Dynamic pricing based on demand
   - Competitive analysis integration
   - Multi-crew scheduling optimization

## Support

For issues or questions:
- Check browser console for error messages
- Review server logs in workflow output
- Verify OpenAI integration is active
- Contact Replit support for AI credit issues
